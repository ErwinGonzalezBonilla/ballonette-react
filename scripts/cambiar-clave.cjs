// Uso:  node scripts/cambiar-clave.cjs TuClaveNueva
// Guarda la "huella" (hash) de la clave en src/config/clave.js
const crypto = require("crypto")
const fs = require("fs")
const path = require("path")

const clave = process.argv.slice(2).join(" ").trim()
if (clave.length < 6) {
  console.log("❌ Escribe una clave de al menos 6 caracteres. Ejemplo: node scripts/cambiar-clave.cjs Globos2026")
  process.exit(1)
}

const hash = crypto.createHash("sha256").update(clave).digest("hex")
const destino = path.join(__dirname, "..", "src", "config", "clave.js")
fs.writeFileSync(
  destino,
  "// Huella de la clave de acceso del equipo (no es la clave en sí).\n" +
    "// Para cambiarla, ejecuta en la terminal:  node scripts/cambiar-clave.cjs TuClaveNueva\n" +
    `export const HASH_CLAVE = "${hash}"\n`
)
console.log("✅ Clave guardada. Recuerda hacer git add, commit y push para publicarla.")
