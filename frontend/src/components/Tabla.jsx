import { useState, useMemo } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

export default function Tabla({ 
  encabezados, 
  datos, 
  renderRow,
  sortableFields = [],
  children
}) {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [sortColumnIndex, setSortColumnIndex] = useState(null);

  // Detectar si está usando el nuevo sistema (datos + renderRow) o antiguo (children)
  const usandoNuevoSistema = datos !== undefined && datos !== null;

  // Convertir encabezados de string a objetos si es necesario
  const encabezadosProcesados = encabezados?.map((header) => {
    if (typeof header === "string") {
      return { label: header, key: header.toLowerCase().replace(/\s+/g, "_") };
    }
    return header;
  }) || [];

  const handleSort = (index, header) => {
    // Para nuevo sistema: usar key de header
    if (usandoNuevoSistema) {
      if (!sortableFields.includes(header?.key)) return;
      
      let newDirection = "asc";
      if (sortField === header?.key && sortDirection === "asc") {
        newDirection = "desc";
      }
      setSortField(header?.key);
      setSortDirection(newDirection);
    } else {
      // Para antiguo sistema: usar índice de columna
      let newDirection = "asc";
      if (sortColumnIndex === index && sortDirection === "asc") {
        newDirection = "desc";
      }
      setSortColumnIndex(index);
      setSortDirection(newDirection);
    }
  };

  // Función auxiliar para extraer valor comparable
  const getComparableValue = (value) => {
    if (value === null || value === undefined) return { type: "string", value: "" };

    // Si es número, retornar como número
    if (typeof value === "number") {
      return { type: "number", value };
    }

    // Si es string, intentar convertir a número
    if (typeof value === "string") {
      const trimmed = value.trim();
      const asNumber = parseFloat(trimmed);
      
      if (!isNaN(asNumber) && trimmed !== "") {
        return { type: "number", value: asNumber };
      }
      return { type: "string", value: trimmed.toLowerCase() };
    }

    return { type: "string", value: String(value).toLowerCase() };
  };

  // Función para comparar valores
  const compareValues = (valA, valB, direction) => {
    const a = getComparableValue(valA);
    const b = getComparableValue(valB);

    // Si ambos son números
    if (a.type === "number" && b.type === "number") {
      return direction === "asc" ? a.value - b.value : b.value - a.value;
    }

    // Si ambos son strings
    if (a.type === "string" && b.type === "string") {
      if (a.value < b.value) return direction === "asc" ? -1 : 1;
      if (a.value > b.value) return direction === "asc" ? 1 : -1;
      return 0;
    }

    // Mixto: números primero
    if (a.type === "number") return -1;
    if (b.type === "number") return 1;
    return 0;
  };

  // Ordenar datos del nuevo sistema
  const getSortedRows = () => {
    if (!datos || !Array.isArray(datos)) return [];
    if (!sortField) return datos;

    const sorted = [...datos].sort((a, b) => {
      const valueA = a[sortField];
      const valueB = b[sortField];
      return compareValues(valueA, valueB, sortDirection);
    });

    return sorted;
  };

  // Ordenar filas del antiguo sistema (children)
  const sortedChildren = useMemo(() => {
    if (usandoNuevoSistema || !children || sortColumnIndex === null) {
      return children;
    }

    const childrenArray = Array.isArray(children) ? children : [children];
    
    // Filtrar solo elementos TR
    const rows = childrenArray.filter(child => child?.type === 'tr');
    
    if (rows.length === 0) return children;

    const sortedRows = [...rows].sort((rowA, rowB) => {
      // Extraer el texto del TD en la columna especificada
      const getTdContent = (row) => {
        const tds = row?.props?.children;
        if (!Array.isArray(tds)) return "";
        const td = tds[sortColumnIndex];
        if (!td) return "";
        
        // Intentar extraer el texto del TD
        let text = "";
        if (typeof td.props.children === "string") {
          text = td.props.children;
        } else if (Array.isArray(td.props.children)) {
          text = td.props.children
            .map(child => typeof child === "string" ? child : child?.props?.contenido || "")
            .join("");
        } else if (td.props.children?.props?.contenido) {
          text = td.props.children.props.contenido;
        }
        return text;
      };

      const textA = getTdContent(rowA);
      const textB = getTdContent(rowB);

      return compareValues(textA, textB, sortDirection);
    });

    return sortedRows;
  }, [children, sortColumnIndex, sortDirection, usandoNuevoSistema]);

  const sortedRows = usandoNuevoSistema ? getSortedRows() : [];

  if (!encabezadosProcesados || encabezadosProcesados.length === 0) {
    return <div className="p-4 text-lila text-center">Tabla sin encabezados</div>;
  }

  return (
    <div className="bg-bg-card rounded-xl border border-lila/10 shadow-lg overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-lila/10 bg-oscuro/50">
            {encabezadosProcesados.map((header, idx) => {
              const isSortable = usandoNuevoSistema 
                ? sortableFields.includes(header.key)
                : true;

              const isSorted = usandoNuevoSistema
                ? sortField === header.key
                : sortColumnIndex === idx;

              return (
                <th 
                  key={idx}
                  onClick={() => handleSort(idx, header)}
                  className={`p-4 text-left text-xs uppercase font-bold tracking-wider text-lila ${
                    isSortable ? "cursor-pointer hover:text-lila-mid transition-colors" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {header.label}
                    {isSortable && isSorted && (
                      sortDirection === "asc" ? <ArrowDown size={14} /> : <ArrowUp size={14} />
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {usandoNuevoSistema ? (
            // Nuevo sistema: datos + renderRow
            sortedRows.length === 0 ? (
              <tr>
                <td 
                  colSpan={encabezadosProcesados.length} 
                  className="text-center py-10 text-sm opacity-50 text-lila"
                >
                  No hay resultados
                </td>
              </tr>
            ) : (
              sortedRows.map((row, i) => renderRow ? renderRow(row, i) : null)
            )
          ) : (
            // Antiguo sistema: children ordenados
            sortedChildren
          )}
        </tbody>
      </table>
    </div>
  );
}