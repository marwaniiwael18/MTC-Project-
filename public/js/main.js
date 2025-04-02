// API Base URL
const API_URL = 'http://localhost:3000';

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Toggle active class
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show selected section with animation
            const targetSection = this.getAttribute('data-section');
            document.querySelectorAll('.section').forEach(section => {
                section.classList.add('d-none');
                section.classList.remove('fade-in');
            });
            const selectedSection = document.getElementById(`${targetSection}-section`);
            selectedSection.classList.remove('d-none');
            // Trigger reflow to restart animation
            void selectedSection.offsetWidth;
            selectedSection.classList.add('fade-in');
            
            // Load data for the section
            if (targetSection === 'plats') loadPlats();
            else if (targetSection === 'users') loadUsers();
            else if (targetSection === 'orders') loadOrders();
        });
    });
    
    // Password visibility toggle
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling;
            const icon = this.querySelector('.material-icons');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.textContent = 'visibility_off';
            } else {
                passwordInput.type = 'password';
                icon.textContent = 'visibility';
            }
        });
    });
    
    // Form submissions
    const addPlatForm = document.getElementById('add-plat-form');
    if (addPlatForm) {
        // Enable form validation styling
        enableFormValidation(addPlatForm);
        
        addPlatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form before submitting
            if (validatePlatForm()) {
                addPlat();
            }
        });
    }
    
    // Setup edit form validation
    const editPlatForm = document.getElementById('edit-plat-form');
    if (editPlatForm) {
        enableFormValidation(editPlatForm);
    }
    
    // Update plat button functionality
    const updatePlatBtn = document.getElementById('update-plat-btn');
    if (updatePlatBtn) {
        updatePlatBtn.addEventListener('click', function() {
            if (validateEditPlatForm()) {
                updatePlat();
            }
        });
    }
    
    // User form submission
    const addUserForm = document.getElementById('add-user-form');
    if (addUserForm) {
        // Enable form validation styling
        enableFormValidation(addUserForm);
        
        addUserForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form before submitting
            if (validateUserForm()) {
                addUser();
            }
        });
    }
    
    // Initial data load with animation
    setTimeout(() => {
        loadPlats();
        document.getElementById('plats-section').classList.add('fade-in');
    }, 100);
});
    
// Form validation functions
function enableFormValidation(form) {
    // Add validation styles on input
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateInput(this);
        });
        input.addEventListener('input', function() {
            validateInput(this);
        });
    });
}

function validateInput(input) {
    const feedbackElement = input.nextElementSibling?.classList.contains('invalid-feedback') 
        ? input.nextElementSibling 
        : null;
    
    // Valid by default
    let isValid = true;
    let errorMessage = '';
        
    // Standard HTML validation
    if (!input.checkValidity()) {
        isValid = false;
        errorMessage = input.validationMessage;
    }
    
    // Custom validation rules
    if (isValid && input.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.value)) {
            isValid = false;
            errorMessage = 'Veuillez entrer une adresse email valide.';
        }
    }
    
    if (isValid && input.id === 'plat-price') {
        const price = parseFloat(input.value);
        if (isNaN(price) || price <= 0) {
            isValid = false;
            errorMessage = 'Le prix doit être un nombre positif.';
        }
    }
    
    if (isValid && input.id === 'user-password') {
        if (input.value.length < 6) {
            isValid = false;
            errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
        }
    }
    
    // Apply validation classes
    if (isValid) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        if (feedbackElement) {
            feedbackElement.textContent = '';
        }
    } else {
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
        // Create feedback element if it doesn't exist
        if (!feedbackElement) {
            const div = document.createElement('div');
            div.className = 'invalid-feedback';
            div.textContent = errorMessage;
            input.parentNode.insertBefore(div, input.nextSibling);
        } else {
            feedbackElement.textContent = errorMessage;
        }
    }
    
    return isValid;
}

function validatePlatForm() {
    const nameInput = document.getElementById('plat-name');
    const descInput = document.getElementById('plat-description');
    const priceInput = document.getElementById('plat-price');
    
    const isNameValid = validateInput(nameInput);
    const isDescValid = validateInput(descInput);
    const isPriceValid = validateInput(priceInput);
    
    return isNameValid && isDescValid && isPriceValid;
}

function validateUserForm() {
    const nameInput = document.getElementById('user-name');
    const emailInput = document.getElementById('user-email');
    const passwordInput = document.getElementById('user-password');
    const roleInput = document.getElementById('user-role');
    
    const isNameValid = validateInput(nameInput);
    const isEmailValid = validateInput(emailInput);
    const isPasswordValid = validateInput(passwordInput);
    const isRoleValid = validateInput(roleInput);
    
    return isNameValid && isEmailValid && isPasswordValid && isRoleValid;
}

// Validates the edit plat form
function validateEditPlatForm() {
    const nameInput = document.getElementById('edit-plat-name');
    const descInput = document.getElementById('edit-plat-description');
    const priceInput = document.getElementById('edit-plat-price');
    
    const isNameValid = validateInput(nameInput);
    const isDescValid = validateInput(descInput);
    const isPriceValid = validateInput(priceInput);
    
    return isNameValid && isDescValid && isPriceValid;
}

// Enhanced loadPlats with animation
function loadPlats() {
    showLoader('plats-list');
    
    fetch(`${API_URL}/plats`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const platsList = document.getElementById('plats-list');
            platsList.innerHTML = '';
            
            // Handle both array format and object with plats property
            const platsArray = Array.isArray(data) ? data : (data.plats || []);
            
            if (platsArray.length === 0) {
                platsList.innerHTML = `
                    <tr>
                        <td colspan="4" class="text-center py-4">
                            <span class="material-icons text-muted mb-2" style="font-size: 48px;">restaurant_menu</span>
                            <p class="text-muted mb-0">Aucun plat disponible</p>
                        </td>
                    </tr>
                `;
                return;
            }
            
            // Get the first item to determine property names
            const samplePlat = platsArray[0];
            // Determine property names (name/nom, description, price/prix)
            const nameKey = 'name' in samplePlat ? 'name' : ('nom' in samplePlat ? 'nom' : 'title');
            const descKey = 'description' in samplePlat ? 'description' : 'desc';
            const priceKey = 'price' in samplePlat ? 'price' : 'prix';
            const idKey = 'id' in samplePlat ? 'id' : '_id';
            
            platsArray.forEach((plat, index) => {
                const row = document.createElement('tr');
                row.style.animationDelay = `${index * 0.05}s`;
                row.innerHTML = `
                    <td>${plat[nameKey] || 'N/A'}</td>
                    <td>${plat[descKey] || 'N/A'}</td>
                    <td>${plat[priceKey] || 0} €</td>
                    <td>
                        <button class="btn btn-sm btn-primary d-inline-flex align-items-center me-1" onclick="editPlat('${plat[idKey]}')">
                            <span class="material-icons" style="font-size: 16px;">edit</span>
                        </button>
                        <button class="btn btn-sm btn-danger d-inline-flex align-items-center" onclick="deletePlat('${plat[idKey]}')">
                            <span class="material-icons" style="font-size: 16px;">delete</span>
                        </button>
                    </td>
                `;
                platsList.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading plats:', error);
            const platsList = document.getElementById('plats-list');
            platsList.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-4">
                        <span class="material-icons text-danger mb-2" style="font-size: 48px;">error</span>
                        <p class="text-danger mb-0">Erreur lors du chargement des plats: ${error.message}</p>
                    </td>
                </tr>
            `;
        });
}

// Add loading indicator
function showLoader(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Chargement...</span>
                    </div>
                    <p class="mt-2 mb-0">Chargement des données...</p>
                </td>
            </tr>
        `;
    }
}

// Add a new plat with enhanced feedback
function addPlat() {
    const name = document.getElementById('plat-name').value.trim();
    const description = document.getElementById('plat-description').value.trim();
    const price = parseFloat(document.getElementById('plat-price').value);
    
    // Additional validation before sending to API
    if (!name || name.length < 2) {
        alert('Le nom du plat doit contenir au moins 2 caractères.');
        return;
    }
    
    if (!description || description.length < 5) {
        alert('La description doit contenir au moins 5 caractères.');
        return;
    }
    
    if (isNaN(price) || price <= 0) {
        alert('Le prix doit être un nombre positif.');
        return;
    }
    
    const platData = {
        name: name,
        description: description,
        price: price
    };
    
    // Disable submit button and show loading state
    const submitBtn = document.getElementById('submit-plat-btn');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Ajout en cours...
    `;
    
    fetch(`${API_URL}/plats`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(platData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Reset form
        document.getElementById('add-plat-form').reset();
        
        // Show success toast instead of alert
        showToast('Plat ajouté avec succès!', 'success');
        
        // Reload plats list
        loadPlats();
    })
    .catch(error => {
        console.error('Error adding plat:', error);
        showToast(`Erreur: ${error.message}`, 'error');
    })
    .finally(() => {
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    });
}

// Edit plat function with enhanced UI
function editPlat(id) {
    console.log(`Editing plat with ID: ${id}`);
    
    // Show loading in modal
    const modalBody = document.querySelector('#editPlatModal .modal-body');
    const originalContent = modalBody.innerHTML;
    modalBody.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Chargement...</span>
            </div>
            <p class="mt-3 mb-0">Chargement des données...</p>
        </div>
    `;
    
    // Show modal while loading
    const modal = new bootstrap.Modal(document.getElementById('editPlatModal'));
    modal.show();
    
    // Fetch the plat data
    fetch(`${API_URL}/plats/${id}`)
        .then(response => {
            if (!response.ok) throw new Error('Plat introuvable');
            return response.json();
        })
        .then(plat => {
            // Restore original content
            modalBody.innerHTML = originalContent;
            
            // Determine which properties to use
            const nameKey = 'name' in plat ? 'name' : ('nom' in plat ? 'nom' : 'title');
            const descKey = 'description' in plat ? 'description' : 'desc';
            const priceKey = 'price' in plat ? 'price' : 'prix';
            
            // Populate form with animation
            setTimeout(() => {
                document.getElementById('edit-plat-id').value = id;
                document.getElementById('edit-plat-name').value = plat[nameKey] || '';
                document.getElementById('edit-plat-description').value = plat[descKey] || '';
                document.getElementById('edit-plat-price').value = plat[priceKey] || 0;
                
                // Setup validation for the restored form
                enableFormValidation(document.getElementById('edit-plat-form'));
            }, 100);
        })
        .catch(error => {
            console.error('Error fetching plat for edit:', error);
            modal.hide();
            showToast(`Erreur: ${error.message}`, 'error');
        });
}

// Update plat function with enhanced feedback
function updatePlat() {
    const id = document.getElementById('edit-plat-id').value;
    const name = document.getElementById('edit-plat-name').value.trim();
    const description = document.getElementById('edit-plat-description').value.trim();
    const price = parseFloat(document.getElementById('edit-plat-price').value);
    
    // Validation
    if (!name || name.length < 2) {
        alert('Le nom du plat doit contenir au moins 2 caractères.');
        return;
    }
    
    if (!description || description.length < 5) {
        alert('La description doit contenir au moins 5 caractères.');
        return;
    }
    
    if (isNaN(price) || price <= 0) {
        alert('Le prix doit être un nombre positif.');
        return;
    }
    
    const platData = {
        name: name,
        description: description,
        price: price
    };
    
    // Disable button and show loading
    const updateBtn = document.getElementById('update-plat-btn');
    const originalBtnText = updateBtn.innerHTML;
    updateBtn.disabled = true;
    updateBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Mise à jour...
    `;
    
    // Make PUT request to update
    fetch(`${API_URL}/plats/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(platData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Hide the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editPlatModal'));
        modal.hide();
        
        // Show success toast
        showToast('Plat modifié avec succès!', 'success');
        
        // Reload plats list
        loadPlats();
    })
    .catch(error => {
        console.error('Error updating plat:', error);
        showToast(`Erreur: ${error.message}`, 'error');
    })
    .finally(() => {
        // Re-enable button
        updateBtn.disabled = false;
        updateBtn.innerHTML = originalBtnText;
    });
}

// Delete plat function
function deletePlat(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce plat ?')) {
        fetch(`${API_URL}/plats/${id}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
            return response.text();
        })
        .then(() => {
            showToast('Plat supprimé avec succès!', 'success');
            loadPlats();
        })
        .catch(error => {
            console.error('Error deleting plat:', error);
            showToast(`Erreur lors de la suppression: ${error.message}`, 'error');
        });
    }
}

// Users section functionality
function loadUsers() {
    fetch(`${API_URL}/users`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const usersList = document.getElementById('users-list');
            if (!usersList) {
                console.error('users-list element not found');
                return;
            }
            
            usersList.innerHTML = '';
            
            // Handle both array format and object with users property
            const usersArray = Array.isArray(data) ? data : (data.users || []);
            
            if (usersArray.length === 0) {
                usersList.innerHTML = '<tr><td colspan="5" class="text-center">Aucun utilisateur disponible</td></tr>';
                return;
            }
            
            usersArray.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.name || user.nom || 'N/A'}</td>
                    <td>${user.email || 'N/A'}</td>
                    <td>${user.role || 'client'}</td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="editUser('${user.id || user._id}')">Modifier</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id || user._id}')">Supprimer</button>
                    </td>
                `;
                usersList.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading users:', error);
            const usersList = document.getElementById('users-list');
            if (usersList) {
                usersList.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Erreur lors du chargement des utilisateurs: ${error.message}</td></tr>`;
            }
        });
}

// Add user functionality
function addUser() {
    const name = document.getElementById('user-name').value.trim();
    const email = document.getElementById('user-email').value.trim();
    const password = document.getElementById('user-password').value;
    const role = document.getElementById('user-role').value;
    
    // Additional validation before sending to API
    if (!name || name.length < 2) {
        alert('Le nom d\'utilisateur doit contenir au moins 2 caractères.');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        alert('Veuillez entrer une adresse email valide.');
        return;
    }
    
    if (!password || password.length < 6) {
        alert('Le mot de passe doit contenir au moins 6 caractères.');
        return;
    }
    
    const userData = {
        name: name,
        email: email,
        password: password,
        role: role
    };
    
    fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Reset form
        document.getElementById('add-user-form').reset();
        // Show success message
        alert('Utilisateur ajouté avec succès!');
        // Reload users list
        loadUsers();
    })
    .catch(error => {
        console.error('Error adding user:', error);
        alert(`Erreur lors de l'ajout de l'utilisateur: ${error.message}`);
    });
}

// Orders section functionality
function loadOrders() {
    fetch(`${API_URL}/orders`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const ordersList = document.getElementById('orders-list');
            if (!ordersList) {
                console.error('orders-list element not found');
                return;
            }
            
            ordersList.innerHTML = '';
            
            // Handle both array format and object with orders property
            const ordersArray = Array.isArray(data) ? data : (data.orders || []);
            
            if (ordersArray.length === 0) {
                ordersList.innerHTML = '<tr><td colspan="5" class="text-center">Aucune commande disponible</td></tr>';
                return;
            }
            
            ordersArray.forEach(order => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${order.orderNumber || order.number || order.id || order._id || 'N/A'}</td>
                    <td>${order.user?.name || order.userName || 'N/A'}</td>
                    <td>${new Date(order.date || order.createdAt).toLocaleDateString()}</td>
                    <td>${order.status || 'En attente'}</td>
                    <td>${order.total || 0} €</td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="viewOrder('${order.id || order._id}')">Voir</button>
                        <button class="btn btn-sm btn-success" onclick="updateOrderStatus('${order.id || order._id}')">Statut</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteOrder('${order.id || order._id}')">Supprimer</button>
                    </td>
                `;
                ordersList.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading orders:', error);
            const ordersList = document.getElementById('orders-list');
            if (ordersList) {
                ordersList.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Erreur lors du chargement des commandes: ${error.message}</td></tr>`;
            }
        });
}

// Stub functions for users and orders that will be implemented later
function editUser(id) {
    alert(`Modification de l'utilisateur ${id} - Fonction à implémenter`);
}

function deleteUser(id) {
    alert(`Suppression de l'utilisateur ${id} - Fonction à implémenter`);
}

function viewOrder(id) {
    alert(`Affichage de la commande ${id} - Fonction à implémenter`);
}

function updateOrderStatus(id) {
    alert(`Mise à jour du statut de la commande ${id} - Fonction à implémenter`);
}

function deleteOrder(id) {
    alert(`Suppression de la commande ${id} - Fonction à implémenter`);
}

// Toggle form between add and edit modes
function setFormMode(mode, id = null, data = null) {
    const form = document.getElementById('add-plat-form');
    const submitButton = document.getElementById('submit-plat-btn');
    const formTitle = document.getElementById('form-title');
    
    if (mode === 'add') {
        editState.mode = 'add';
        editState.currentId = null;
        editState.originalData = null;
        
        // Clear form
        form.reset();
        
        // Update UI
        submitButton.textContent = 'Ajouter';
        formTitle.textContent = 'Ajouter un plat';
        
        // Remove cancel button if it exists
        const cancelBtn = document.getElementById('cancel-edit-btn');
        if (cancelBtn) {
            cancelBtn.remove();
        }
        
    } else if (mode === 'edit' && id && data) {
        editState.mode = 'edit';
        editState.currentId = id;
        editState.originalData = data;
        
        // Update UI
        submitButton.textContent = 'Modifier';
        formTitle.textContent = 'Modifier un plat';
        
        // Add cancel button if it doesn't exist
        if (!document.getElementById('cancel-edit-btn')) {
            const cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.className = 'btn btn-secondary me-2';
            cancelBtn.id = 'cancel-edit-btn';
            cancelBtn.textContent = 'Annuler';
            cancelBtn.addEventListener('click', function() {
                setFormMode('add');
            });
            submitButton.parentNode.insertBefore(cancelBtn, submitButton);
        }
    }
}

// Toast notification system
function showToast(message, type = 'info') {
    const toastContainer = document.querySelector('.toast-container');
    
    let bgColor, icon;
    switch (type) {
        case 'success':
            bgColor = 'bg-success';
            icon = 'check_circle';
            break;
        case 'error':
            bgColor = 'bg-danger';
            icon = 'error';
            break;
        case 'warning':
            bgColor = 'bg-warning';
            icon = 'warning';
            break;
        default:
            bgColor = 'bg-info';
            icon = 'info';
    }
    
    const toast = document.createElement('div');
    toast.className = `toast show ${bgColor} text-white`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="toast-header ${bgColor} text-white">
            <span class="material-icons me-2">${icon}</span>
            <strong class="me-auto">Notification</strong>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}