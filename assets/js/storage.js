/* =======================================================
   STORAGE.JS - Utilidades de localStorage
   ======================================================= */

const ALMACENAMIENTO = {
    USUARIOS: 'apu_usuarios',
    VENDEDORES: 'apu_vendedores',
    PRODUCTOS: 'apu_productos',
    CARRITO: 'apu_carrito',
    PEDIDOS: 'apu_pedidos',
    SESION: 'apu_sesion_actual'
};

const ESTADOS_PEDIDO = {
    ORIGEN: 'Origen',
    TRANSITO: 'En Tránsito',
    DESTINO: 'Destino',
    ENTREGADO: 'Entregado'
};

const METODOS_PAGO = {
    TARJETA: 'Tarjeta de Crédito/Débito',
    PAYPAL: 'PayPal',
    TRANSFERENCIA: 'Transferencia Bancaria'
};

function almacenarDatos(clave, datos) {
    try {
        localStorage.setItem(clave, JSON.stringify(datos));
        return true;
    } catch (error) {
        console.error('Error al guardar datos:', error);
        return false;
    }
}

function obtenerDatos(clave) {
    try {
        const datos = localStorage.getItem(clave);
        return datos ? JSON.parse(datos) : null;
    } catch (error) {
        console.error('Error al obtener datos:', error);
        return null;
    }
}

function eliminarDatos(clave) {
    try {
        localStorage.removeItem(clave);
        return true;
    } catch (error) {
        console.error('Error al eliminar datos:', error);
        return false;
    }
}

function inicializarDatos() {
    if (!obtenerDatos(ALMACENAMIENTO.USUARIOS)) {
        almacenarDatos(ALMACENAMIENTO.USUARIOS, []);
    }
    if (!obtenerDatos(ALMACENAMIENTO.VENDEDORES)) {
        almacenarDatos(ALMACENAMIENTO.VENDEDORES, []);
    }
    if (!obtenerDatos(ALMACENAMIENTO.PRODUCTOS)) {
        almacenarDatos(ALMACENAMIENTO.PRODUCTOS, []);
    }
    if (!obtenerDatos(ALMACENAMIENTO.CARRITO)) {
        almacenarDatos(ALMACENAMIENTO.CARRITO, []);
    }
    if (!obtenerDatos(ALMACENAMIENTO.PEDIDOS)) {
        almacenarDatos(ALMACENAMIENTO.PEDIDOS, []);
    }
}

function iniciarSesion(usuario) {
    const sesion = {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        telefono: usuario.telefono,
        fechaLogin: new Date().toISOString()
    };
    return almacenarDatos(ALMACENAMIENTO.SESION, sesion);
}

function obtenerSesion() {
    return obtenerDatos(ALMACENAMIENTO.SESION);
}

function cerrarSesion() {
    return eliminarDatos(ALMACENAMIENTO.SESION);
}

function estaAutenticado() {
    return obtenerSesion() !== null;
}

function esComprador() {
    const sesion = obtenerSesion();
    return sesion && sesion.rol === 'comprador';
}

function esVendedor() {
    const sesion = obtenerSesion();
    return sesion && sesion.rol === 'vendedor';
}

function generarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function generarCodigoPedido() {
    const fecha = new Date();
    const ano = fecha.getFullYear().toString().slice(-2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    const aleatorio = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `APU-${ano}${mes}${dia}-${aleatorio}`;
}

function generarCodigoSeguimiento() {
    return 'TRK' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
}

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function sanitizeString(str) {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/[<>]/g, '');
}

function formatearPrecio(precio) {
    return 'S/ ' + parseFloat(precio).toFixed(2);
}

function obtenerFechaActual() {
    return new Date().toISOString();
}

function agregarDias(fecha, dias) {
    const resultado = new Date(fecha);
    resultado.setDate(resultado.getDate() + dias);
    return resultado.toISOString();
}

function calcularEnvio(region) {
    const costos = {
        'cusco': 15,
        'lambayque': 25,
        'arequipa': 30,
        'trujillo': 35,
        'chiclayo': 30,
        'piura': 35,
        'internacional': 80
    };
    return costos[region.toLowerCase()] || 25;
}

function obtenerNombreRegion(region) {
    const nombres = {
        'cusco': 'Cusco',
        'lambayque': 'Lambayeque',
        'arequipa': 'Arequipa',
        'trujillo': 'La Libertad',
        'chiclayo': 'Lambayeque',
        'piura': 'Piura',
        'internacional': 'Internacional'
    };
    return nombres[region.toLowerCase()] || region;
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;

    const iconos = {
        'success': 'fas fa-check-circle',
        'error': 'fas fa-times-circle',
        'info': 'fas fa-info-circle'
    };

    toast.innerHTML = `
        <i class="toast-icon ${iconos[tipo]}"></i>
        <span class="toast-message">${mensaje}</span>
        <i class="toast-close fas fa-times"></i>
    `;

    container.appendChild(toast);

    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.remove();
    });

    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function mostrarLoader(elemento, texto = 'Cargando...') {
    if (!elemento) return;
    elemento.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p class="loading-text">${texto}</p>
        </div>
    `;
}

function ocultarLoader(elemento) {
    if (!elemento) return;
    elemento.innerHTML = '';
}

function redirigirPorRol() {
    const sesion = obtenerSesion();
    if (sesion) {
        if (sesion.rol === 'comprador') {
            window.location.href = 'comprador/catalogo.html';
        } else if (sesion.rol === 'vendedor') {
            window.location.href = 'vendedor/dashboard.html';
        }
    }
}

function verificarAutenticacion() {
    if (!estaAutenticado()) {
        window.location.href = '../login.html';
        return false;
    }
    return true;
}

function verificarRolVendedor() {
    if (!verificarAutenticacion()) return false;
    if (!esVendedor()) {
        window.location.href = '../login.html';
        return false;
    }
    return true;
}

function verificarRolComprador() {
    if (!verificarAutenticacion()) return false;
    if (!esComprador()) {
        window.location.href = '../login.html';
        return false;
    }
    return true;
}

function inicializarDatosPrueba() {
    const usuarios = obtenerDatos(ALMACENAMIENTO.USUARIOS) || [];
    
    if (usuarios.length === 0) {
        const usuariosPrueba = [
            {
                id: generarId(),
                nombre: 'Carlos Mendoza',
                email: 'comprador@apu.com',
                password: 'Comprador123',
                telefono: '+51 984 123 456',
                rol: 'comprador',
                fechaRegistro: obtenerFechaActual()
            },
            {
                id: generarId(),
                nombre: 'Ana Quispe',
                email: 'vendedor@apu.com',
                password: 'Vendedor123',
                telefono: '+51 984 654 321',
                rol: 'vendedor',
                fechaRegistro: obtenerFechaActual()
            }
        ];
        
        almacenarDatos(ALMACENAMIENTO.USUARIOS, usuariosPrueba);
    }

    const productos = obtenerDatos(ALMACENAMIENTO.PRODUCTOS) || [];
    
    if (productos.length === 0) {
        const productosPrueba = [
            {
                id: generarId(),
                nombre: 'Poncho Inti Raymi',
                categoria: 'abrigos',
                precio: 380,
                precioOriginal: 480,
                material: '100% Alpaca Baby',
                descripcion: 'Poncho tradicional cusqueño con motivos incas tejido por artesanas de Chinchero.',
                imagen: 'image/chica-joven-poncho-andino-rojo.jpg',
                colores: ['#8B0000', '#1A1A1A', '#F5F5DC'],
                talles: ['Único'],
                stock: 15,
                vendedorId: 'vendedor1',
                vendedorNombre: 'Tiendas Andinas',
                fechaPublicacion: obtenerFechaActual(),
                estado: 'activo'
            },
            {
                id: generarId(),
                nombre: 'Chompa Qori',
                categoria: 'chompas',
                precio: 220,
                precioOriginal: null,
                material: 'Mezcla Alpaca-Merino',
                descripcion: 'Suéter de alpaca premium con diseño contemporáneo.',
                imagen: 'image/chica-joven-asiatica-polera-lana.jpg',
                colores: ['#8B4513', '#2F4F4F'],
                talles: ['S', 'M', 'L', 'XL'],
                stock: 28,
                vendedorId: 'vendedor1',
                vendedorNombre: 'Tiendas Andinas',
                fechaPublicacion: obtenerFechaActual(),
                estado: 'activo'
            },
            {
                id: generarId(),
                nombre: 'Bufanda Pachamama',
                categoria: 'accesorios',
                precio: 95,
                precioOriginal: null,
                material: 'Alpaca Superfina',
                descripcion: 'Bufanda tejida a mano con patrones tradicionales.',
                imagen: 'image/poncho-andino-rojo-blanco.jpg',
                colores: ['#D2691E', '#4B0082', '#2F4F4F'],
                talles: ['Único'],
                stock: 45,
                vendedorId: 'vendedor1',
                vendedorNombre: 'Tiendas Andinas',
                fechaPublicacion: obtenerFechaActual(),
                estado: 'activo'
            },
            {
                id: generarId(),
                nombre: 'Vestido Saqsaywaman',
                categoria: 'vestidos',
                precio: 310,
                precioOriginal: 390,
                material: 'Algodón Pima & Alpaca',
                descripcion: 'Vestido tradicional con tejidos contemporáneos.',
                imagen: 'image/chica-vestido-rojo.jpg',
                colores: ['#8B0000', '#FF6347'],
                talles: ['XS', 'S', 'M', 'L'],
                stock: 12,
                vendedorId: 'vendedor1',
                vendedorNombre: 'Tiendas Andinas',
                fechaPublicacion: obtenerFechaActual(),
                estado: 'activo'
            },
            {
                id: generarId(),
                nombre: 'Abrigo Ausangate',
                categoria: 'abrigos',
                precio: 520,
                precioOriginal: null,
                material: '100% Alpaca Royal',
                descripcion: 'Abrigo de alpaca premium inspirado en lo inca.',
                imagen: 'image/chica-joven-saco-negro.jpg',
                colores: ['#1A1A1A', '#8B4513'],
                talles: ['M', 'L', 'XL'],
                stock: 8,
                vendedorId: 'vendedor1',
                vendedorNombre: 'Tiendas Andinas',
                fechaPublicacion: obtenerFechaActual(),
                estado: 'activo'
            },
            {
                id: generarId(),
                nombre: 'Chaleco Willka',
                categoria: 'chompas',
                precio: 175,
                precioOriginal: 210,
                material: 'Alpaca Baby',
                descripcion: 'Chaleco tradicional con bordados típicos.',
                imagen: 'image/chica-joven-chalero-andino.jpg',
                colores: ['#8B0000', '#1A1A1A'],
                talles: ['S', 'M', 'L'],
                stock: 20,
                vendedorId: 'vendedor1',
                vendedorNombre: 'Tiendas Andinas',
                fechaPublicacion: obtenerFechaActual(),
                estado: 'activo'
            },
            {
                id: generarId(),
                nombre: 'Gorro Chakana',
                categoria: 'accesorios',
                precio: 65,
                precioOriginal: null,
                material: 'Alpaca Superfina',
                descripcion: 'Gorro con símbolo de la Chakana (cruz andina).',
                imagen: 'image/chullo-andino.jpg',
                colores: ['#1A1A1A', '#8B4513', '#8B0000'],
                talles: ['Único'],
                stock: 50,
                vendedorId: 'vendedor1',
                vendedorNombre: 'Tiendas Andinas',
                fechaPublicacion: obtenerFechaActual(),
                estado: 'activo'
            },
            {
                id: generarId(),
                nombre: 'Falda Qoya',
                categoria: 'vestidos',
                precio: 195,
                precioOriginal: null,
                material: 'Lana de Alpaca & Seda',
                descripcion: 'Falda tradicional con colores vibrantes.',
                imagen: 'image/chica-pollera.jpg',
                colores: ['#FF6347', '#FFD700', '#4B0082'],
                talles: ['XS', 'S', 'M', 'L', 'XL'],
                stock: 22,
                vendedorId: 'vendedor1',
                vendedorNombre: 'Tiendas Andinas',
                fechaPublicacion: obtenerFechaActual(),
                estado: 'activo'
            },
            {
                id: generarId(),
                nombre: 'Poncho Andino Rojo',
                categoria: 'abrigos',
                precio: 450,
                precioOriginal: null,
                material: '100% Alpaca',
                descripcion: 'Poncho rojo con bordados tradicionales y símbolos andinos.',
                imagen: 'image/poncho-mujer.jpg',
                colores: ['#8B0000', '#1A1A1A'],
                talles: ['Único'],
                stock: 18,
                vendedorId: 'vendedor1',
                vendedorNombre: 'Tiendas Andinas',
                fechaPublicacion: obtenerFechaActual(),
                estado: 'activo'
            },
            {
                id: generarId(),
                nombre: 'Polera Andina',
                categoria: 'chompas',
                precio: 150,
                precioOriginal: null,
                material: 'Alpaca & Lana',
                descripcion: 'Polera cómoda de alpaca para uso diario.',
                imagen: 'image/abrigos-ponchos-mujer.jpg',
                colores: ['#F5F5DC', '#8B4513'],
                talles: ['S', 'M', 'L', 'XL'],
                stock: 35,
                vendedorId: 'vendedor1',
                vendedorNombre: 'Tiendas Andinas',
                fechaPublicacion: obtenerFechaActual(),
                estado: 'activo'
            }
        ];
        
        almacenarDatos(ALMACENAMIENTO.PRODUCTOS, productosPrueba);
    }

    const pedidos = obtenerDatos(ALMACENAMIENTO.PEDIDOS) || [];
    
    if (pedidos.length === 0) {
        const pedidosPrueba = [
            {
                id: generarId(),
                codigoPedido: 'APU-260501-0001',
                codigoSeguimiento: 'TRK12345678',
                compradorId: 'comprador1',
                compradorNombre: 'Carlos Mendoza',
                items: [
                    {
                        productoId: 'prod1',
                        nombre: 'Poncho Inti Raymi',
                        cantidad: 1,
                        precio: 380,
                        talle: 'Único',
                        color: '#8B0000'
                    }
                ],
                total: 395,
                envio: 15,
                estado: ESTADOS_PEDIDO.TRANSITO,
                metodopago: METODOS_PAGO.TARJETA,
                direccion: {
                    region: 'cusco',
                    ciudad: 'Cusco',
                    distrito: 'Wanchaq',
                    codigoPostal: '08000',
                    referencia: 'Cerca al mercado central'
                },
                fechaPedido: agregarDias(obtenerFechaActual(), -3),
                fechaEstimada: agregarDias(obtenerFechaActual(), 4),
                vendedorId: 'vendedor1',
                vendedorNombre: 'Tiendas Andinas'
            }
        ];
        
        almacenarDatos(ALMACENAMIENTO.PEDIDOS, pedidosPrueba);
    }
}

if (typeof window !== 'undefined') {
    window.StorageUtils = {
        almacen: ALMACENAMIENTO,
        estados: ESTADOS_PEDIDO,
        metodos: METODOS_PAGO,
        guardar: almacenarDatos,
        obtener: obtenerDatos,
        eliminar: eliminarDatos,
        iniciar: iniciarSesion,
        obtenerSesion: obtenerSesion,
        cerrar: cerrarSesion,
        estaAutenticado: estaAutenticado,
        esComprador: esComprador,
        esVendedor: esVendedor,
        generarId: generarId,
        codigoPedido: generarCodigoPedido,
        codigoSeg: generarCodigoSeguimiento,
        validarEmail: validarEmail,
        sanitize: sanitizeString,
        precio: formatearPrecio,
        fecha: obtenerFechaActual,
        agregarDias: agregarDias,
        costoEnvio: calcularEnvio,
        nombreRegion: obtenerNombreRegion,
        toast: mostrarNotificacion,
        loader: mostrarLoader,
        unload: ocultarLoader,
        redirigir: redirigirPorRol,
        verificarAuth: verificarAutenticacion,
        verificarVendedor: verificarRolVendedor,
        verificarComprador: verificarRolComprador,
        init: inicializarDatos,
        initPrueba: inicializarDatosPrueba
    };
}