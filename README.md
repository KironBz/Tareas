# Tareas - Gestor de Tareas por Materias

Una aplicación web moderna para organizar y gestionar tareas por materias, con sincronización automática en GitHub Gist.

## 🎯 Características

- **Dashboard de Materias**: Visualiza todas tus materias como tarjetas interactivas
- **Gestión de Tareas**: CRUD completo (Crear, Leer, Actualizar, Eliminar)
- **Dos Vistas Principales**:
  - Vista de materia específica con todas sus tareas
  - Lista global de todas las tareas ordenadas por fecha
- **Prioridades**: Código de colores (🟢 Baja, 🟡 Media, 🔴 Alta)
- **Sincronización con GitHub Gist**: Backup automático en la nube
- **Almacenamiento Local**: localStorage para funcionamiento sin conexión
- **Diseño Dark Mode**: Interfaz oscura con morado, azul y acentos verdes
- **Responsive**: Funciona en desktop y móvil

## 🚀 Uso

### Configuración Inicial

1. **Crear un Token de GitHub**:
   - Ve a https://github.com/settings/tokens
   - Click en "Generate new token (classic)"
   - Selecciona permisos para `gist`
   - Copia el token

2. **Configurar en la App**:
   - Abre la app y ve a ⚙️ Configuración
   - Pega tu token en "Token Personal de GitHub"
   - Deja vacío "ID del Gist" para que cree uno automático
   - Click en "Guardar Configuración"

### Uso de la App

#### Dashboard (Materias)
- **+ Nueva Materia**: Crea una materia con nombre, profesor y color
- **Click en materia**: Entra a la lista de tareas de esa materia
- **Editar/Borrar**: Modifica o elimina materias

#### Tareas
- **+ Nueva Tarea**: Crea una tarea con:
  - Título
  - Descripción (opcional)
  - Materia
  - Fecha de entrega
  - Prioridad (1-3)
- **✓ Checkbox**: Marca como completada
- **✏️ Editar**: Modifica la tarea
- **🗑️ Borrar**: Elimina la tarea

#### Todas las Tareas
- Ver todas las tareas de todas las materias
- Ordenadas automáticamente por fecha (más próximas primero)
- Filtrar por prioridad

## 💾 Sincronización

- **Automática**: Cada vez que creas/editas/eliminas, se sincroniza con Gist
- **Manual**: Botón "Sincronizar Ahora" en Configuración
- **Backup**: Los datos también están en localStorage

## 📲 Backup y Restauración

En Configuración puedes:
- **Descargar Backup**: Exporta todo a un archivo JSON
- **Importar Backup**: Restaura desde un archivo JSON
- **Limpiar Todo**: Elimina todos los datos locales (⚠️ irreversible)

## 🛠 Desarrollo

### Stack
- **HTML5** - Estructura semántica
- **CSS3** - Variables, Flexbox, Grid, Animations
- **JavaScript Vanilla** - Sin dependencias externas
- **GitHub Gist API** - Sincronización en la nube
- **localStorage** - Almacenamiento local

### Estructura de Datos

```javascript
// Materia
{
  id: "1abc...",
  name: "Cálculo III",
  teacher: "Dr. García",
  color: "#6d28d9",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:30:00Z"
}

// Tarea
{
  id: "2xyz...",
  subjectId: "1abc...",
  title: "Proyecto Final",
  description: "Entregar análisis de series",
  dueDate: "2024-02-10",
  importance: 3, // 1=baja, 2=media, 3=alta
  completed: false,
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:30:00Z"
}
```

## 🔐 Privacidad

- El token de GitHub se guarda **solo en localStorage** de tu navegador
- Nunca se envía a servidores de terceros
- Los datos se sincronizan directamente con tu Gist privado
- Puedes eliminar los datos locales cuando quieras

## 🐛 Troubleshooting

### La sincronización no funciona
- Verifica que el token sea válido
- Asegúrate de tener conexión a internet
- Revisa la consola del navegador (F12) para errores

### Los datos no persisten
- Verifica que localStorage esté habilitado
- Intenta limpiar caché del navegador
- Exporta un backup regularmente

### GitHub Pages no muestra los cambios
- Espera 1-2 minutos a que se actualice
- Limpia caché del navegador (Ctrl+Shift+Del)
- Verifica que los archivos estén en la rama `main`

## 📝 Licencia

Proyecto personal - Libre de usar y modificar

---

**Made with 💜 para gestionar tus tareas eficientemente**