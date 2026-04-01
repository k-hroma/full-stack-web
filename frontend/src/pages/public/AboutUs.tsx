/**
 * Quiénes Somos - La Palacio
 * @module components/AboutUs
 */

import { ExternalLink } from '../../components/common/ExternalLink';
import AboutUsBanner from '../../components/banners/AboutUsBanner';
import '../../styles/pages/public/about-us.css';

export default function AboutUs() {
  const team = [
    {
      name: 'Croma',
      role: 'librera, desarrolladora web y experimentadora audiovisual. Pueden ver algunos de sus proyectos en',
      ig: '@cromix__',
      link: 'https://www.instagram.com/cromix__/'
    },
    {
      name: 'Mecha',
      role: 'librero, editor, artista en el plano astral. Pueden ver algunos de sus proyectos en',
      ig: '@fernando.crocamo',
      link: 'https://www.instagram.com/fernando.crocamo'
    },
    {
      name: 'Ro Fuks',
      role: 'diseñadora gráfica (especializada en editorial, branding e ilustración). directora de @elhecho_editorial. Pueden ver algunos de sus proyectos en',
      ig: '@rofuks',
      link: 'https://www.instagram.com/rofuks/'
    }
  ];

  return (
    <div>
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
                    <p className="member-role">{member.role} <ExternalLink href={member.link} className="member-link">
                      {member.ig}
                    </ExternalLink></p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Columna derecha - Descripción */}
            <div className="quienes-somos__description">
              <p className="description-text">
                La Palacio es una librería <em>online</em>, marika y lesbiana.
                Recomendamos y vendemos libros nuevos, libros usados, fanzines y otras publicaciones gráficas.
              </p>

              <p className="description-text">
                Participamos en ferias, festivales y eventos culturales, y formamos parte de la red de librerías y editoriales independientes de Argentina.
              </p>

              <p className="description-text">
                Junto a <ExternalLink href="https://www.instagram.com/elhecho_editorial" className="description-text">
                  @elhecho_editorial
                </ExternalLink>, editamos y publicamos textos que consideramos referencias importantes en la literatura, la teoría y las artes.
              </p>
            </div>
          </div>
        </div>

      </section>
      <AboutUsBanner />
    </div>
  );
}