/**
 * Quiénes Somos - La Palacio
 * @module components/AboutUs
 */

import '../../styles/pages/public/about-us.css';

export default function AboutUs() {
  const team = [
    {
      name: 'Khroma',
      role: 'librera, desarrolladora web y artista audiovisual. Pueden ver algunos de sus proyectos en khayra.com.ar',
      link: 'khayra.com.ar'
    },
    {
      name: 'Mecha',
      role: 'librera hace 20 años. Pasó por tal tal y tal librería. Participó en tal tal y tal. Pueden escribirle a @lamecharecomienda',
      link: '@lamecharecomienda'
    },
    {
      name: 'Ro Fuks',
      role: 'diseñadora gráfica (especializada en editorial, branding e ilustración). Pueden ver algunos de sus proyectos en bebaroofuks.com',
      link: 'bebaroofuks.com'
    }
  ];

  return (
    <section className="quienes-somos">
      <div className="quienes-somos__container">
        {/* Título */}
        <h2 className="quienes-somos__title">Quiénes somos</h2>

        {/* Contenido grid */}
        <div className="quienes-somos__content">
          {/* Columna izquierda - Equipo */}
          <div className="quienes-somos__team">
            <h3 className="team-title">Nosotrxs</h3>
            <ul className="team-list">
              {team.map((member, index) => (
                <li key={index} className="team-member">
                  <span className="member-name">{member.name}</span>
                  <p className="member-role">
                    {member.role.split(member.link)[0]}
                    <a
                      href={`https://${member.link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="member-link"
                    >
                      {member.link}
                    </a>
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna derecha - Descripción */}
          <div className="quienes-somos__description">
            <p className="description-text">
              La Palacio es una librería digital de libros nuevos y usados, recomendados por Mecha y Kroma (librerxs hace 20 años), y Ro Fuks (diseñadora editorial hace 15 años).
            </p>

            <p className="description-text">
              Somos un proyecto autogestivo y <span className="highlight">queer</span> que surge del deseo de acercar las lecturas, creaciones y reflexiones para repensarnos y fortalecer redes.
            </p>

            <p className="description-text">
              Somos personas <span className="highlight">queer</span>, leemos libros <span className="highlight">queer</span>, y también nos guiamos por lo <span className="highlight">queer</span> en un sentido más amplio: celebramos <span className="highlight">otras</span> formas de pensar y desafiamos las normas patriarcales, tradicionales, machistas y hegemónicas.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}