// ============================================
// TAREAS - App.js
// Sistema de gestión de tareas por materias
// ============================================

// ============================================
// ESTADO GLOBAL
// ============================================
const APP_STATE = {
  subjects: [],
  tasks: [],
  currentSubjectId: null,
  editingTaskId: null,
  editingSubjectId: null,
  gistToken: null,
  gistId: null,
};

// ============================================
// ELEMENTOS DEL DOM
// ============================================
const DOM = {
  // Vistas
  dashboardView: document.getElementById('dashboard-view'),
  subjectTasksView: document.getElementById('subject-tasks-view'),
  alltasksView: document.getElementById('alltasks-view'),
  settingsView: document.getElementById('settings-view'),

  // Navegación
  navDashboard: document.getElementById('nav-dashboard'),
  navAllTasks: document.getElementById('nav-alltasks'),
  navSettings: document.getElementById('nav-settings'),
  syncIndicator: document.getElementById('sync-indicator'),
  syncText: document.getElementById('sync-text'),

  // Dashboard
  subjectsGrid: document.getElementById('subjects-grid'),
  btnNewSubject: document.getElementById('btn-new-subject'),

  // Vistas de tareas
  subjectTitle: document.getElementById('subject-title'),
  subjectTasksList: document.getElementById('subject-tasks-list'),
  btnBackToDashboard: document.getElementById('btn-back-to-dashboard'),
  btnNewTaskSubject: document.getElementById('btn-new-task-subject'),
  alltasksList: document.getElementById('alltasks-list'),
  filterImportance: document.getElementById('filter-importance'),

  // Modales
  taskModal: document.getElementById('task-modal'),
  subjectModal: document.getElementById('subject-modal'),
  taskForm: document.getElementById('task-form'),
  subjectForm: document.getElementById('subject-form'),

  // Configuración
  gistTokenInput: document.getElementById('gist-token'),
  gistIdInput: document.getElementById('gist-id'),
  btnSaveConfig: document.getElementById('btn-save-config'),
  btnSyncNow: document.getElementById('btn-sync-now'),
  btnExportData: document.getElementById('btn-export-data'),
  btnImportData: document.getElementById('btn-import-data'),
  btnClearData: document.getElementById('btn-clear-data'),
  fileImport: document.getElementById('file-import'),
  configMessage: document.getElementById('config-message'),
};

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  loadFromLocalStorage();
  setupEventListeners();
  renderDashboard();
  checkGistConfiguration();
});

function setupEventListeners() {
  // Navegación
  DOM.navDashboard.addEventListener('click', () => switchView('dashboard'));
  DOM.navAllTasks.addEventListener('click', () => switchView('alltasks'));
  DOM.navSettings.addEventListener('click', () => switchView('settings'));

  // Dashboard
  DOM.btnNewSubject.addEventListener('click', () => openSubjectModal());
  DOM.btnBackToDashboard.addEventListener('click', () => switchView('dashboard'));
  DOM.btnNewTaskSubject.addEventListener('click', () => openTaskModal());

  // Tareas
  DOM.filterImportance.addEventListener('change', renderAllTasks);

  // Modales
  setupModalHandlers();

  // Configuración
  DOM.btnSaveConfig.addEventListener('click', saveGistConfig);
  DOM.btnSyncNow.addEventListener('click', syncWithGist);
  DOM.btnExportData.addEventListener('click', exportData);
  DOM.btnImportData.addEventListener('click', () => DOM.fileImport.click());
  DOM.fileImport.addEventListener('change', importData);
  DOM.btnClearData.addEventListener('click', () => {
    if (confirm('¿Estás seguro? Esto eliminará todos tus datos locales.')) {
      localStorage.clear();
      APP_STATE.subjects = [];
      APP_STATE.tasks = [];
      renderDashboard();
      showMessage('Datos eliminados', 'success');
    }
  });

  // Formularios
  DOM.taskForm.addEventListener('submit', handleTaskSubmit);
  DOM.subjectForm.addEventListener('submit', handleSubjectSubmit);
}

function setupModalHandlers() {
  // Task Modal
  const taskCloseBtn = DOM.taskModal.querySelector('.modal-close');
  const taskCancelBtn = document.getElementById('btn-cancel-task');
  
  taskCloseBtn.addEventListener('click', closeTaskModal);
  taskCancelBtn.addEventListener('click', closeTaskModal);
  DOM.taskModal.addEventListener('click', (e) => {
    if (e.target === DOM.taskModal) closeTaskModal();
  });

  // Subject Modal
  const subjectCloseBtn = DOM.subjectModal.querySelector('.modal-close');
  const subjectCancelBtn = document.getElementById('btn-cancel-subject');
  
  subjectCloseBtn.addEventListener('click', closeSubjectModal);
  subjectCancelBtn.addEventListener('click', closeSubjectModal);
  DOM.subjectModal.addEventListener('click', (e) => {
    if (e.target === DOM.subjectModal) closeSubjectModal();
  });
}

// ============================================
// GESTIÓN DE VISTAS
// ============================================
function switchView(viewName) {
  // Ocultar todas las vistas
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  
  // Desactivar todos los botones de nav
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  // Mostrar vista seleccionada y activar botón
  switch(viewName) {
    case 'dashboard':
      DOM.dashboardView.classList.add('active');
      DOM.navDashboard.classList.add('active');
      renderDashboard();
      break;
    case 'alltasks':
      DOM.alltasksView.classList.add('active');
      DOM.navAllTasks.classList.add('active');
      renderAllTasks();
      break;
    case 'settings':
      DOM.settingsView.classList.add('active');
      DOM.navSettings.classList.add('active');
      break;
    case 'subject-tasks':
      DOM.subjectTasksView.classList.add('active');
      renderSubjectTasks();
      break;
  }
}

// ============================================
// RENDERIZADO - DASHBOARD
// ============================================
function renderDashboard() {
  DOM.subjectsGrid.innerHTML = '';

  if (APP_STATE.subjects.length === 0) {
    DOM.subjectsGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📚</div>
        <p>No hay materias aún. ¡Crea una para comenzar!</p>
      </div>
    `;
    return;
  }

  APP_STATE.subjects.forEach(subject => {
    const tasksCount = APP_STATE.tasks.filter(t => t.subjectId === subject.id).length;
    const completedCount = APP_STATE.tasks.filter(
      t => t.subjectId === subject.id && t.completed
    ).length;

    const card = document.createElement('div');
    card.className = 'subject-card';
    card.style.setProperty('--card-color', subject.color || '#6d28d9');
    
    card.innerHTML = `
      <div class="subject-card-content">
        <div class="subject-name">${escapeHtml(subject.name)}</div>
        ${subject.teacher ? `<div class="subject-teacher">${escapeHtml(subject.teacher)}</div>` : ''}
        
        <div class="subject-stats">
          <div class="subject-stat">
            <span>📋</span> ${tasksCount} tareas
          </div>
          <div class="subject-stat">
            <span>✓</span> ${completedCount} completadas
          </div>
        </div>

        <div class="subject-card-actions">
          <button class="btn-open-subject" data-id="${subject.id}">Abrir</button>
          <button class="btn-edit-subject" data-id="${subject.id}">Editar</button>
          <button class="btn-delete-subject" data-id="${subject.id}">Borrar</button>
        </div>
      </div>
    `;

    card.querySelector('.btn-open-subject').addEventListener('click', () => {
      APP_STATE.currentSubjectId = subject.id;
      switchView('subject-tasks');
    });

    card.querySelector('.btn-edit-subject').addEventListener('click', () => {
      openSubjectModal(subject.id);
    });

    card.querySelector('.btn-delete-subject').addEventListener('click', () => {
      if (confirm(`¿Eliminar materia "${subject.name}" y todas sus tareas?`)) {
        deleteSubject(subject.id);
      }
    });

    DOM.subjectsGrid.appendChild(card);
  });
}

// ============================================
// RENDERIZADO - TAREAS DE MATERIA
// ============================================
function renderSubjectTasks() {
  const subject = APP_STATE.subjects.find(s => s.id === APP_STATE.currentSubjectId);
  if (!subject) return;

  DOM.subjectTitle.textContent = subject.name;

  const tasks = APP_STATE.tasks
    .filter(t => t.subjectId === APP_STATE.currentSubjectId)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  DOM.subjectTasksList.innerHTML = '';

  if (tasks.length === 0) {
    DOM.subjectTasksList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <p>No hay tareas en esta materia aún.</p>
      </div>
    `;
    return;
  }

  tasks.forEach(task => {
    const taskEl = createTaskElement(task);
    DOM.subjectTasksList.appendChild(taskEl);
  });
}

// ============================================
// RENDERIZADO - TODAS LAS TAREAS
// ============================================
function renderAllTasks() {
  const filterValue = DOM.filterImportance.value;

  let tasks = [...APP_STATE.tasks];

  if (filterValue) {
    tasks = tasks.filter(t => t.importance === parseInt(filterValue));
  }

  // Ordenar por fecha más cercana a hoy
  tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  DOM.alltasksList.innerHTML = '';

  if (tasks.length === 0) {
    DOM.alltasksList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">✓</div>
        <p>No hay tareas con esa prioridad.</p>
      </div>
    `;
    return;
  }

  tasks.forEach(task => {
    const taskEl = createTaskElement(task, true);
    DOM.alltasksList.appendChild(taskEl);
  });
}

// ============================================
// CREAR ELEMENTO DE TAREA
// ============================================
function createTaskElement(task, showSubject = false) {
  const subject = APP_STATE.subjects.find(s => s.id === task.subjectId);
  const dueDate = new Date(task.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  let dateClass = '';
  if (dueDate < today) dateClass = 'urgent';
  else if (dueDate.getTime() === today.getTime()) dateClass = 'today';
  else dateClass = 'upcoming';

  const taskEl = document.createElement('div');
  taskEl.className = `task-item priority-${task.importance} ${task.completed ? 'completed' : ''}`;
  
  taskEl.innerHTML = `
    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
    
    <div class="task-content">
      <div class="task-header">
        <div>
          <div class="task-title">${escapeHtml(task.title)}</div>
          ${showSubject && subject ? `<span class="task-subject">${escapeHtml(subject.name)}</span>` : ''}
        </div>
      </div>
      
      ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
      
      <div class="task-meta">
        <div class="task-duedate ${dateClass}">
          📅 ${formatDate(task.dueDate)}
        </div>
        <div class="task-importance">
          ${task.importance === 1 ? '🟢 Baja' : task.importance === 2 ? '🟡 Media' : '🔴 Alta'}
        </div>
      </div>
    </div>

    <div class="task-actions">
      <button class="btn-edit" title="Editar">✏️</button>
      <button class="btn-delete" title="Eliminar">🗑️</button>
    </div>
  `;

  // Event listeners
  taskEl.querySelector('.task-checkbox').addEventListener('change', () => {
    toggleTaskComplete(task.id);
  });

  taskEl.querySelector('.btn-edit').addEventListener('click', () => {
    openTaskModal(task.id);
  });

  taskEl.querySelector('.btn-delete').addEventListener('click', () => {
    if (confirm('¿Eliminar esta tarea?')) {
      deleteTask(task.id);
    }
  });

  return taskEl;
}

// ============================================
// MODAL DE TAREAS
// ============================================
function openTaskModal(taskId = null) {
  APP_STATE.editingTaskId = taskId;
  
  const title = document.getElementById('modal-title');
  const subjectSelect = document.getElementById('task-subject');
  const titleInput = document.getElementById('task-title');
  const descInput = document.getElementById('task-description');
  const dueDateInput = document.getElementById('task-duedate');
  const importanceInput = document.getElementById('task-importance');

  // Limpiar y llenar opciones de materias
  subjectSelect.innerHTML = '<option value="">Selecciona una materia</option>';
  APP_STATE.subjects.forEach(subject => {
    const option = document.createElement('option');
    option.value = subject.id;
    option.textContent = subject.name;
    subjectSelect.appendChild(option);
  });

  if (taskId) {
    // Editar tarea existente
    const task = APP_STATE.tasks.find(t => t.id === taskId);
    if (!task) return;

    title.textContent = 'Editar Tarea';
    subjectSelect.value = task.subjectId;
    titleInput.value = task.title;
    descInput.value = task.description;
    dueDateInput.value = task.dueDate;
    importanceInput.value = task.importance;
  } else {
    // Nueva tarea
    title.textContent = 'Nueva Tarea';
    
    // Si estamos en vista de materia específica, preflenar
    if (APP_STATE.currentSubjectId) {
      subjectSelect.value = APP_STATE.currentSubjectId;
    }

    // Limpiar formulario
    DOM.taskForm.reset();
    dueDateInput.value = getDefaultDueDate();
    importanceInput.value = '2';
  }

  DOM.taskModal.classList.add('active');
}

function closeTaskModal() {
  DOM.taskModal.classList.remove('active');
  DOM.taskForm.reset();
  APP_STATE.editingTaskId = null;
}

function handleTaskSubmit(e) {
  e.preventDefault();

  const subjectId = document.getElementById('task-subject').value;
  const title = document.getElementById('task-title').value;
  const description = document.getElementById('task-description').value;
  const dueDate = document.getElementById('task-duedate').value;
  const importance = parseInt(document.getElementById('task-importance').value);

  if (!subjectId || !title || !dueDate) {
    showMessage('Por favor completa los campos requeridos', 'error');
    return;
  }

  if (APP_STATE.editingTaskId) {
    // Actualizar tarea
    const task = APP_STATE.tasks.find(t => t.id === APP_STATE.editingTaskId);
    task.subjectId = subjectId;
    task.title = title;
    task.description = description;
    task.dueDate = dueDate;
    task.importance = importance;
    task.updatedAt = new Date().toISOString();
  } else {
    // Crear nueva tarea
    const newTask = {
      id: generateId(),
      subjectId,
      title,
      description,
      dueDate,
      importance,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    APP_STATE.tasks.push(newTask);
  }

  saveToLocalStorage();
  closeTaskModal();

  // Renderizar vista actual
  if (APP_STATE.currentSubjectId) {
    renderSubjectTasks();
  } else {
    renderAllTasks();
  }

  showMessage('Tarea guardada ✓', 'success');
  syncWithGist();
}

// ============================================
// MODAL DE MATERIAS
// ============================================
function openSubjectModal(subjectId = null) {
  APP_STATE.editingSubjectId = subjectId;
  
  const title = document.getElementById('subject-modal-title');
  const nameInput = document.getElementById('subject-name');
  const colorInput = document.getElementById('subject-color');
  const teacherInput = document.getElementById('subject-teacher');

  if (subjectId) {
    // Editar materia
    const subject = APP_STATE.subjects.find(s => s.id === subjectId);
    if (!subject) return;

    title.textContent = 'Editar Materia';
    nameInput.value = subject.name;
    colorInput.value = subject.color || '#6d28d9';
    teacherInput.value = subject.teacher || '';
  } else {
    // Nueva materia
    title.textContent = 'Nueva Materia';
    DOM.subjectForm.reset();
    colorInput.value = '#6d28d9';
  }

  DOM.subjectModal.classList.add('active');
}

function closeSubjectModal() {
  DOM.subjectModal.classList.remove('active');
  DOM.subjectForm.reset();
  APP_STATE.editingSubjectId = null;
}

function handleSubjectSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('subject-name').value;
  const color = document.getElementById('subject-color').value;
  const teacher = document.getElementById('subject-teacher').value;

  if (!name) {
    showMessage('El nombre de la materia es requerido', 'error');
    return;
  }

  if (APP_STATE.editingSubjectId) {
    // Actualizar materia
    const subject = APP_STATE.subjects.find(s => s.id === APP_STATE.editingSubjectId);
    subject.name = name;
    subject.color = color;
    subject.teacher = teacher;
    subject.updatedAt = new Date().toISOString();
  } else {
    // Crear nueva materia
    const newSubject = {
      id: generateId(),
      name,
      color,
      teacher,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    APP_STATE.subjects.push(newSubject);
  }

  saveToLocalStorage();
  closeSubjectModal();
  renderDashboard();

  showMessage('Materia guardada ✓', 'success');
  syncWithGist();
}

// ============================================
// OPERACIONES CRUD
// ============================================
function toggleTaskComplete(taskId) {
  const task = APP_STATE.tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    task.updatedAt = new Date().toISOString();
    saveToLocalStorage();

    if (APP_STATE.currentSubjectId) {
      renderSubjectTasks();
    } else {
      renderAllTasks();
    }

    syncWithGist();
  }
}

function deleteTask(taskId) {
  APP_STATE.tasks = APP_STATE.tasks.filter(t => t.id !== taskId);
  saveToLocalStorage();

  if (APP_STATE.currentSubjectId) {
    renderSubjectTasks();
  } else {
    renderAllTasks();
  }

  showMessage('Tarea eliminada', 'success');
  syncWithGist();
}

function deleteSubject(subjectId) {
  APP_STATE.subjects = APP_STATE.subjects.filter(s => s.id !== subjectId);
  APP_STATE.tasks = APP_STATE.tasks.filter(t => t.subjectId !== subjectId);
  saveToLocalStorage();
  renderDashboard();

  showMessage('Materia eliminada', 'success');
  syncWithGist();
}

// ============================================
// LOCALSTORAGE
// ============================================
function saveToLocalStorage() {
  const data = {
    subjects: APP_STATE.subjects,
    tasks: APP_STATE.tasks,
    lastSync: new Date().toISOString(),
  };
  localStorage.setItem('tareas-app-data', JSON.stringify(data));
}

function loadFromLocalStorage() {
  const stored = localStorage.getItem('tareas-app-data');
  if (stored) {
    const data = JSON.parse(stored);
    APP_STATE.subjects = data.subjects || [];
    APP_STATE.tasks = data.tasks || [];
  }

  // Cargar config de Gist
  const gistConfig = localStorage.getItem('tareas-gist-config');
  if (gistConfig) {
    const config = JSON.parse(gistConfig);
    APP_STATE.gistToken = config.token;
    APP_STATE.gistId = config.gistId;
    DOM.gistTokenInput.value = config.token || '';
    DOM.gistIdInput.value = config.gistId || '';
  }
}

// ============================================
// SINCRONIZACIÓN CON GIST
// ============================================
function checkGistConfiguration() {
  if (APP_STATE.gistToken) {
    DOM.syncIndicator.classList.remove('offline');
    DOM.syncIndicator.classList.add('online');
    DOM.syncText.textContent = 'Sincronizado';
  }
}

function saveGistConfig() {
  const token = DOM.gistTokenInput.value.trim();
  const gistId = DOM.gistIdInput.value.trim();

  if (!token) {
    showMessage('El token de GitHub es requerido', 'error', 'config-message');
    return;
  }

  APP_STATE.gistToken = token;
  APP_STATE.gistId = gistId;

  const config = { token, gistId };
  localStorage.setItem('tareas-gist-config', JSON.stringify(config));

  showMessage('Configuración guardada ✓', 'success', 'config-message');
  checkGistConfiguration();
}

async function syncWithGist() {
  if (!APP_STATE.gistToken) {
    return; // Sin configuración, no sincronizar
  }

  try {
    DOM.syncIndicator.classList.remove('online', 'offline');
    DOM.syncText.textContent = 'Sincronizando...';

    const data = {
      subjects: APP_STATE.subjects,
      tasks: APP_STATE.tasks,
      lastSync: new Date().toISOString(),
    };

    if (APP_STATE.gistId) {
      // Actualizar Gist existente
      await updateGist(data);
    } else {
      // Crear nuevo Gist
      const newGistId = await createGist(data);
      APP_STATE.gistId = newGistId;
      DOM.gistIdInput.value = newGistId;
      
      const config = {
        token: APP_STATE.gistToken,
        gistId: newGistId,
      };
      localStorage.setItem('tareas-gist-config', JSON.stringify(config));
    }

    DOM.syncIndicator.classList.add('online');
    DOM.syncText.textContent = 'Sincronizado';
    showMessage('Sincronizado con Gist ✓', 'success', 'config-message');
  } catch (error) {
    console.error('Error sincronizando:', error);
    DOM.syncIndicator.classList.add('offline');
    DOM.syncText.textContent = 'Error de sincronización';
    showMessage('Error al sincronizar: ' + error.message, 'error', 'config-message');
  }
}

async function createGist(data) {
  const response = await fetch('https://api.github.com/gists', {
    method: 'POST',
    headers: {
      'Authorization': `token ${APP_STATE.gistToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description: 'Tareas App - Backup automático',
      public: false,
      files: {
        'tareas-data.json': {
          content: JSON.stringify(data, null, 2),
        },
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error creando Gist');
  }

  const gist = await response.json();
  return gist.id;
}

async function updateGist(data) {
  const response = await fetch(`https://api.github.com/gists/${APP_STATE.gistId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `token ${APP_STATE.gistToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      files: {
        'tareas-data.json': {
          content: JSON.stringify(data, null, 2),
        },
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error actualizando Gist');
  }
}

// ============================================
// EXPORT/IMPORT
// ============================================
function exportData() {
  const data = {
    subjects: APP_STATE.subjects,
    tasks: APP_STATE.tasks,
    exportedAt: new Date().toISOString(),
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tareas-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showMessage('Datos exportados ✓', 'success', 'config-message');
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      APP_STATE.subjects = data.subjects || [];
      APP_STATE.tasks = data.tasks || [];
      saveToLocalStorage();
      renderDashboard();
      showMessage('Datos importados ✓', 'success', 'config-message');
    } catch (error) {
      showMessage('Error al importar: ' + error.message, 'error', 'config-message');
    }
  };
  reader.readAsText(file);
}

// ============================================
// UTILIDADES
// ============================================
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('es-ES', options);
}

function getDefaultDueDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showMessage(text, type = 'info', targetId = 'config-message') {
  const container = document.getElementById(targetId);
  if (!container) return;

  container.textContent = text;
  container.className = `message show ${type}`;

  setTimeout(() => {
    container.classList.remove('show');
  }, 4000);
}