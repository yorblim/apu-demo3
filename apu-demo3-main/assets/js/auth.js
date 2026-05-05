/* =======================================================
   AUTH.JS - Sistema de Autenticación
   ======================================================= */

(function() {
    const storage = window.StorageUtils;

    document.addEventListener('DOMContentLoaded', function() {
        inicializarSistema();

        if (document.getElementById('form-login')) {
            configurarLogin();
        }

        if (document.getElementById('form-registro')) {
            configurarRegistro();
        }

        if (document.getElementById('btn-cerrar-sesion')) {
            configurarLogout();
        }
    });

    function inicializarSistema() {
        storage.init();
        storage.initPrueba();

        if (storage.estaAutenticado()) {
            const path = window.location.pathname;
            const isInComprador = path.includes('/comprador/');
            const isInVendedor = path.includes('/vendedor/');
            
            // Si ya estamos en una ruta de nuestro rol, no redirigir
            if (isInComprador || isInVendedor) {
                return;
            }

            const paginasPublicas = ['login.html', 'registro.html', 'index.html', 'catalogo-publico.html'];
            const paginaActual = path.split('/').pop();
            
            if (paginasPublicas.includes(paginaActual) || paginaActual === '') {
                storage.redirigir();
            }
        }
    }

    function configurarLogin() {
        const formulario = document.getElementById('form-login');
        const errorDiv = document.getElementById('login-error');
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');
        const rememberCheck = document.getElementById('login-remember');

        formulario.addEventListener('submit', function(e) {
            e.preventDefault();
            errorDiv.classList.remove('show');
            errorDiv.textContent = '';

            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const remember = rememberCheck ? rememberCheck.checked : false;

            if (!email || !password) {
                errorDiv.textContent = 'Por favor completa todos los campos';
                errorDiv.classList.add('show');
                return;
            }

            if (!storage.validarEmail(email)) {
                errorDiv.textContent = 'Por favor ingresa un correo electrónico válido';
                errorDiv.classList.add('show');
                return;
            }

            const usuarios = storage.obtener(storage.almacen.USUARIOS);
            const usuario = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

            if (!usuario) {
                errorDiv.textContent = 'Correo o contraseña incorrectos';
                errorDiv.classList.add('show');
                return;
            }

            storage.iniciar(usuario);

            if (remember) {
                localStorage.setItem('apu_recordar', email);
            } else {
                localStorage.removeItem('apu_recordar');
            }

            storage.toast('¡Bienvenido, ' + usuario.nombre + '!', 'success');

            setTimeout(function() {
                storage.redirigir();
            }, 1000);
        });

        const emailGuardado = localStorage.getItem('apu_recordar');
        if (emailGuardado) {
            emailInput.value = emailGuardado;
            if (rememberCheck) rememberCheck.checked = true;
        }
    }

    function configurarRegistro() {
        const formulario = document.getElementById('form-registro');
        const errorDiv = document.getElementById('registro-error');
        const roleBtns = document.querySelectorAll('.role-btn');
        let rolSeleccionado = 'comprador';

        roleBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                roleBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                rolSeleccionado = this.dataset.rol;
            });
        });

        roleBtns[0].classList.add('active');

        formulario.addEventListener('submit', function(e) {
            e.preventDefault();
            errorDiv.classList.remove('show');
            errorDiv.textContent = '';

            const nombre = document.getElementById('registro-nombre').value.trim();
            const email = document.getElementById('registro-email').value.trim();
            const password = document.getElementById('registro-password').value;
            const confirmPassword = document.getElementById('registro-confirm').value;
            const telefono = document.getElementById('registro-telefono').value.trim();
            const terminos = document.getElementById('registro-terminos');

            if (!nombre || !email || !password || !confirmPassword || !telefono) {
                errorDiv.textContent = 'Por favor completa todos los campos';
                errorDiv.classList.add('show');
                return;
            }

            if (!storage.validarEmail(email)) {
                errorDiv.textContent = 'Por favor ingresa un correo electrónico válido';
                errorDiv.classList.add('show');
                return;
            }

            if (password.length < 6) {
                errorDiv.textContent = 'La contraseña debe tener al menos 6 caracteres';
                errorDiv.classList.add('show');
                return;
            }

            if (password !== confirmPassword) {
                errorDiv.textContent = 'Las contraseñas no coinciden';
                errorDiv.classList.add('show');
                return;
            }

            if (!terminos.checked) {
                errorDiv.textContent = 'Debes aceptar los términos y condiciones';
                errorDiv.classList.add('show');
                return;
            }

            const usuarios = storage.obtener(storage.almacen.USUARIOS);
            
            if (usuarios.find(u => u.email.toLowerCase() === email.toLowerCase())) {
                errorDiv.textContent = 'Este correo ya está registrado';
                errorDiv.classList.add('show');
                return;
            }

            const nuevoUsuario = {
                id: storage.generarId(),
                nombre: storage.sanitize(nombre),
                email: email.toLowerCase(),
                password: password,
                telefono: storage.sanitize(telefono),
                rol: rolSeleccionado,
                fechaRegistro: storage.fecha()
            };

            usuarios.push(nuevoUsuario);
            storage.guardar(storage.almacen.USUARIOS, usuarios);

            storage.iniciar(nuevoUsuario);

            storage.toast('¡Cuenta creada exitosamente!', 'success');

            setTimeout(function() {
                storage.redirigir();
            }, 1500);
        });
    }

    function configurarLogout() {
        const btn = document.getElementById('btn-cerrar-sesion');
        
        btn.addEventListener('click', function() {
            storage.cerrar();
            storage.toast('Sesión cerrada correctamente', 'info');
            
            setTimeout(function() {
                window.location.href = '../login.html';
            }, 1000);
        });
    }

    window.AuthUtils = {
        verificarSesion: function() {
            return storage.verificarAuth();
        },
        verificarVendedor: function() {
            return storage.verificarVendedor();
        },
        verificarComprador: function() {
            return storage.verificarComprador();
        },
        cerrarSesion: function() {
            storage.cerrar();
        }
    };

})();