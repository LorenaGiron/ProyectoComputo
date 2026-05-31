import { useState, useEffect } from "react";
import img1 from "../../assets/images/clothes-rack-1.jpg";
import img2 from "../../assets/images/clothes-rack-2.jpg";
import img3 from "../../assets/images/clothes-rack-3.jpg";

const beneficios = [
  { icono: "bi-truck",        titulo: "Envío express 24h",   sub: "CDMX · GDL · MTY"       },
  { icono: "bi-arrow-repeat", titulo: "30 días devolución",  sub: ""                        },
  { icono: "bi-shield-check", titulo: "Pagos seguros",       sub: "Tarjeta · OXXO · SPEI"  },
  { icono: "bi-star-fill",    titulo: "4.8 ★ promedio",      sub: "+24,800 reseñas"         },
];

const banners = [
  {
    kicker: "Quiénes somos",
    titulo: "Moda que te define",
    sub: "AURA nació en CDMX con una misión: piezas únicas para personas que no siguen tendencias, las crean",
    cta: "Conoce AURA",
    imagen: img1,
  },
  {
    kicker: "Por qué AURA",
    titulo: "Por qué elegirnos",
    sub: "Cada prenda AURA es seleccionada a mano. Sin producción masiva, sin repetidos — solo piezas que valen la pena",
    cta: "Ver colección",
    imagen: img2,
  },
  {
    kicker: "Compra sin complicaciones",
    titulo: "Rápido, seguro y a tu puerta",
    sub: "Envío express 24h · Paga con tarjeta, OXXO o transferencia · 30 días de devolución",
    cta: "Comprar ahora",
    imagen: img3,
  },
];

export default function HeroCarrusel() {
  const [indiceActivo, setIndiceActivo] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndiceActivo((i) => (i + 1) % banners.length);
    }, 6000);
    return () => clearInterval(intervalo);
  }, []);

  const banner = banners[indiceActivo];

  return (
    <section className="max-w-[1480px] mx-auto px-6 lg:px-10 mt-6">
      <div className="relative rounded-3xl overflow-hidden border border-lila/15 shadow-2xl h-[420px] md:h-[500px]">

        {/* Imagen de fondo */}
        <img
          src={banner.imagen}
          alt={banner.titulo}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
        />

        {/* Overlay oscuro para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-r from-oscuro/90 via-oscuro/60 to-transparent" />

        {/* Contenido del banner */}
        <div className="relative h-full flex flex-col justify-center p-8 md:p-14 max-w-2xl">
          <p className="text-[12px] tracking-[5px] text-lila-soft uppercase font-bold">
            {banner.kicker}
          </p>
          <h2
            className="mt-3 text-5xl md:text-7xl font-extrabold text-blanco leading-[0.95]"
            style={{ fontFamily: "'Cinzel Decorative', serif" }}
          >
            {banner.titulo}
          </h2>
          <p className="mt-4 text-base md:text-lg text-lila-soft max-w-md">
            {banner.sub}
          </p>
          <div className="mt-7 flex items-center gap-3 flex-wrap">
            <button className="bg-lila text-oscuro font-bold px-7 py-3.5 rounded-full hover:bg-lila-soft hover:scale-[1.02] transition-all flex items-center gap-2">
              {banner.cta}
              <i className="bi bi-arrow-right" />
            </button>
            <button className="bg-transparent text-blanco font-bold px-7 py-3.5 rounded-full border border-lila/30 hover:border-lila transition-all">
              Ver lookbook
            </button>
          </div>

          {/* Indicadores del carrusel */}
          <div className="mt-8 flex items-center gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndiceActivo(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === indiceActivo ? "w-10 bg-lila" : "w-4 bg-lila/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Tarjetas de beneficios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {beneficios.map((b) => (
          <div
            key={b.titulo}
            className="flex items-center gap-3 bg-bg-card border border-lila/10 rounded-xl p-4"
          >
            <div className="w-11 h-11 rounded-xl bg-lila/10 text-lila flex items-center justify-center shrink-0">
              <i className={`bi ${b.icono} text-xl`} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-blanco">{b.titulo}</p>
              <p className="text-xs text-text-muted truncate">{b.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
