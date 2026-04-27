import ceo from '../assets/ceo.png'

function About() {
  return (
    <section className="about" id="about">

      <div className="about-container">

        <div className="about-text">

          <h2>About Us</h2>

          <p className="lead">
            Ballonette es una firma creativa especializada en diseño de experiencias para eventos de alto impacto.
          </p>

          <p>
            Nos enfocamos en <strong>globos de autor</strong>, <strong>catering decorativo</strong> y <strong>diseño floral boutique</strong>.
          </p>

          <p>
            Creamos experiencias personalizadas para eventos únicos.
          </p>

          <div className="about-signature">
            <h3>Katherine Gonzalez</h3>
            <span>CEO & Founder</span>
          </div>

        </div>

        <div className="about-image">
          <img 
            src={ceo} 
            alt="Katherine Gonzalez CEO Ballonette" 
          />
        </div>

      </div>

    </section>
  )
}

export default About