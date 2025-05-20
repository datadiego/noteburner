// Puerto en el que se ejecutará el servidor
export const port = 8000

// Tiempo que esperamos para comprobar si debemos eliminar el archivo
// cada 5 minutos */5 * * * *
// cada minuto * * * * *
// cada hora   0 * * * *
// cada dia    0 0 * * *
export const cronSchedule = '*/5 * * * *'

// Tiempo que estará disponible el archivo antes de ser eliminado
// 60000 = 1 minuto
// 3600000 = 1 hora
// 86400000 = 24 horas
export const deletionTime = 60000
