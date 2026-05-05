/* =======================================================
   COMPONENTES.JS - Header y Footer dinámicos
   ======================================================= */

(function() {
    const storage = window.StorageUtils;
    
    // Generar navbar según estado de sesión
    window.generarNavbar = function() {
        const sesion = storage.obtenerSesion();
        const autenticado = storage.estaAutenticado();
        
        if (autenticado && sesion && sesion.rol === 'comprador') {
            return `
                <header class="navbar-comprador">
                    <div class="navbar-logo">
                        <a href="../index.html">
                            <img src="../image/Logo-Apu-Luxury-dorado-negro.png" alt="APU LUXURY">
                        </a>
                    </div>
                    <nav class="navbar-menu">
                        <a href="./catalogo.html">CATÁLOGO</a>
                        <a href="./mi-cuenta.html">MI CUENTA</a>
                        <a href="./seguimiento-privado.html">PEDIDOS</a>
                    </nav>
                    <div class="navbar-icons">
                        <a href="./catalogo.html" class="navbar-icon"><i class="fas fa-search"></i></a>
                        <div class="navbar-dropdown">
                            <a class="navbar-icon"><i class="fas fa-user"></i></a>
                            <div class="navbar-dropdown-menu">
                                <a href="./mi-cuenta.html" class="navbar-dropdown-item"><i class="fas fa-user"></i> Mi Cuenta</a>
                                <a href="./seguimiento-privado.html" class="navbar-dropdown-item"><i class="fas fa-box"></i> Mis Pedidos</a>
                                <div class="navbar-dropdown-divider"></div>
                                <a href="../login.html" class="navbar-dropdown-item" id="btn-cerrar-sesion"><i class="fas fa-sign-out-alt"></i> Cerrar Sesión</a>
                            </div>
                        </div>
                        <a href="./carrito.html" class="navbar-icon">
                            <i class="fas fa-shopping-bag"></i>
                            <span class="navbar-cart-count" id="cart-count" style="display: none;">0</span>
                        </a>
                        <button class="mobile-menu-btn" id="menu-btn"><i class="fas fa-bars"></i></button>
                    </div>
                </header>
                <div class="mobile-menu" id="mobile-menu">
                    <i class="fas fa-times mobile-close" id="menu-close"></i>
                    <a href="./catalogo.html">CATÁLOGO</a>
                    <a href="./mi-cuenta.html">MI CUENTA</a>
                    <a href="./seguimiento-privado.html">MIS PEDIDOS</a>
                    <a href="../login.html" id="btn-cerrar-sesion-mobile">CERRAR SESIÓN</a>
                </div>
            `;
        } else {
            return `
                <header class="navbar-comprador">
                    <div class="navbar-logo">
                        <a href="../index.html">
                            <img src="../image/Logo-Apu-Luxury-dorado-negro.png" alt="APU LUXURY">
                        </a>
                    </div>
                    <nav class="navbar-menu">
                        <a href="../index.html">INICIO</a>
                        <a href="./catalogo.html" class="active">CATÁLOGO</a>
                        <a href="../index.html#historia">HISTORIA</a>
                    </nav>
                    <div class="navbar-icons">
                        <a href="./catalogo.html" class="navbar-icon"><i class="fas fa-search"></i></a>
                        <a href="../login.html" class="navbar-icon"><i class="fas fa-user"></i></a>
                        <a href="../carrito.html" class="navbar-icon">
                            <i class="fas fa-shopping-bag"></i>
                        </a>
                        <button class="mobile-menu-btn" id="menu-btn"><i class="fas fa-bars"></i></button>
                    </div>
                </header>
                <div class="mobile-menu" id="mobile-menu">
                    <i class="fas fa-times mobile-close" id="menu-close"></i>
                    <a href="../index.html">INICIO</a>
                    <a href="./catalogo.html">CATÁLOGO</a>
                    <a href="../index.html#historia">HISTORIA</a>
                    <a href="../login.html">INICIAR SESIÓN</a>
                </div>
            `;
        }
    };
    
    window.generarFooter = function() {
        return `
            <footer class="footer-comprador">
                <div class="footer-grid">
                    <div class="footer-brand">
                        <div class="footer-logo">
                            <img src="../image/Logo-Apu-Luxury-dorado-negro.png" alt="APU LUXURY">
                        </div>
                        <p class="footer-desc">Moda andina de alta calidad, tejida a mano en Cusco con fibra de alpaca auténtica.</p>
                    </div>
                    <div class="footer-col">
                        <h4 class="footer-title">NAVEGACIÓN</h4>
                        <div class="footer-links">
                            <a href="../index.html">Inicio</a>
                            <a href="./catalogo.html">Catálogo</a>
                            <a href="../index.html#historia">Nuestra História</a>
                        </div>
                    </div>
                    <div class="footer-col">
                        <h4 class="footer-title">INFORMACIÓN</h4>
                        <div class="footer-links">
                            <a href="#">Envíos</a>
                            <a href="#">Preguntas Frecuentes</a>
                        </div>
                    </div>
                    <div class="footer-col footer-newsletter">
                        <h4 class="footer-title">ÚNETE</h4>
                        <p>Recibe ofertas exclusivas.</p>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; 2026 APU LUXURY. Todos los derechos reservados.</p>
                </div>
            </footer>
        `;
    };
    
    // Inicializar componentes
    document.addEventListener('DOMContentLoaded', function() {
        const navbarContainer = document.getElementById('navbar-container');
        const footerContainer = document.getElementById('footer-container');
        
        if (navbarContainer) navbarContainer.innerHTML = window.generarNavbar();
        if (footerContainer) footerContainer.innerHTML = window.generarFooter();
        
        // Menú hamburguesa
        const menuBtn = document.getElementById('menu-btn');
        const menuClose = document.getElementById('menu-close');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (menuBtn && mobileMenu) {
            menuBtn.addEventListener('click', () => mobileMenu.classList.add('active'));
        }
        if (menuClose && mobileMenu) {
            menuClose.addEventListener('click', () => mobileMenu.classList.remove('active'));
        }
        
        // Cerrar sesión
        const btnCerrar = document.getElementById('btn-cerrar-sesion');
        const btnCerrarMobile = document.getElementById('btn-cerrar-sesion-mobile');
        
        const cerrarSesion = () => {
            storage.cerrar();
            window.location.href = '../login.html';
        };
        
        if (btnCerrar) btnCerrar.addEventListener('click', cerrarSesion);
        if (btnCerrarMobile) btnCerrarMobile.addEventListener('click', cerrarSesion);
    });
    
})();