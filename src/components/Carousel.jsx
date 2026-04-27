import { useState, useEffect } from "react"

// ✅ IMPORTS (correcto en React + Vite)
import img1 from "../assets/images/carousel/carousel-1.png"
import img2 from "../assets/images/carousel/carousel-2.png"
import img3 from "../assets/images/carousel/carousel-3.png"

const images = [img1, img2, img3]

function Carousel() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="carousel-section">

      <div className="carousel-container">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt="carousel"
            className={`carousel-img ${index === current ? "active" : ""}`}
          />
        ))}
      </div>

    </section>
  )
}

export default Carousel