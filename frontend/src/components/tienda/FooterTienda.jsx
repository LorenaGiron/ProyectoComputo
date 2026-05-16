const columnas = [
  {
    titulo: "Comprar",
    links: ["Novedades", "Best sellers", "Sale", "Lookbook", "Gift cards"],
  },
  {
    titulo: "Ayuda",
    links: ["Envíos", "Devoluciones", "Guía de tallas", "Contacto", "FAQ"],
  },
  {
    titulo: "Empresa",
    links: ["Sobre AURA", "Sustentabilidad", "Carreras", "Prensa", "Términos"],
  },
];

export default function FooterTienda() {
  return (
    <footer className="mt-16 bg-oscuro-card border-t border-lila/10">

      {/* Columnas de información */}
      <div className="max-w-[1480px] mx-auto px-6 lg:px-10 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">

        {/* Info de marca */}
        <div className="col-span-2">
          <h3
            className="text-3xl text-lila tracking-tight"
            style={{ fontFamily: "'Cinzel Decorative', serif" }}
          >
            AURA
          </h3>
          <p className="mt-3 text-sm text-lila-soft max-w-sm">
            Boutique digital de moda urbana. Diseñado en CDMX con piezas en edición limitada para cada mood.
          </p>

          {/* Redes sociales */}
          <div className="mt-4 flex gap-2">
            {["bi-instagram", "bi-tiktok", "bi-pinterest", "bi-twitter-x", "bi-youtube"].map((icono) => (
              <button
                key={icono}
                className="w-9 h-9 rounded-full bg-lila/10 text-lila hover:bg-lila hover:text-oscuro transition"
              >
                <i className={`bi ${icono}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Columnas de links */}
        {columnas.map((col) => (
          <div key={col.titulo}>
            <p className="text-[11px] tracking-[3px] text-lila-mid uppercase font-bold mb-3">
              {col.titulo}
            </p>
            <ul className="m-0 p-0 list-none flex flex-col gap-2">
              {col.links.map((link) => (
                <li key={link}>
                  <span className="text-sm text-lila-soft hover:text-blanco cursor-pointer transition-colors">
                    {link}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Barra inferior de copyright */}
      <div className="border-t border-lila/10 py-4">
        <div className="max-w-[1480px] mx-auto px-6 lg:px-10 flex justify-between items-center flex-wrap gap-3">
          <p className="text-xs text-text-muted">
            © 2026 AURA Boutique · Todos los derechos reservados
          </p>
          <div className="flex gap-2 items-center text-text-muted">
            <span className="text-[10px] tracking-widest uppercase">Aceptamos</span>
            <i className="bi bi-credit-card-2-front text-lg" />
            <i className="bi bi-paypal text-lg" />
            <i className="bi bi-apple text-lg" />
            <i className="bi bi-shop text-lg" />
          </div>
        </div>
      </div>
    </footer>
  );
}
