// Lleva a una sección de la portada, aunque estemos en otra página
export function irASeccion(id, navigate, pathname) {
  const desplazar = () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  if (pathname !== "/") {
    navigate("/")
    setTimeout(desplazar, 150)
  } else {
    desplazar()
  }
}
