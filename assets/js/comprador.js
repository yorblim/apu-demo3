/* =======================================================
   COMPRADOR.JS - Lógica del Comprador
   ======================================================= */

(function() {
    const storage = window.StorageUtils;

    document.addEventListener('DOMContentLoaded', function() {
        if (!storage.verificarComprador()) return;

        if (document.getElementById('catalogo-page')) {
            inicializarCatalogo();
        }

        if (document.getElementById('carrito-page')) {
            inicializarCarrito();
        }

        if (document.getElementById('pago-page')) {
            inicializarCheckout();
        }

        if (document.getElementById('seguimiento-page')) {
            inicializarSeguimiento();
        }

        if (document.getElementById('mi-cuenta-page')) {
            inicializarMiCuenta();
        }

        actualizarContadorCarrito();
    });

    function inicializarCatalogo() {
        renderizarProductos();
        configurarFiltros();
        configurarBusqueda();
    }

    function renderizarProductos(filtros = {}) {
        const grid = document.getElementById('productos-grid');
        if (!grid) return;

        storage.loader(grid, 'Cargando productos...');

        setTimeout(function() {
            let productos = storage.obtener(storage.almacen.PRODUCTOS) || [];

            if (filtros.categoria && filtros.categoria !== 'todas') {
                productos = productos.filter(p => p.categoria === filtros.categoria);
            }

            if (filtros.busqueda) {
                const termino = filtros.busqueda.toLowerCase();
                productos = productos.filter(p => 
                    p.nombre.toLowerCase().includes(termino) ||
                    p.descripcion.toLowerCase().includes(termino) ||
                    p.categoria.toLowerCase().includes(termino)
                );
            }

            if (productos.length === 0) {
                grid.innerHTML = `
                    <div class="empty-state" style="grid-column: 1 / -1;">
                        <i class="empty-state-icon fas fa-search"></i>
                        <h3 class="empty-state-title">No se encontraron productos</h3>
                        <p class="empty-state-desc">Intenta con otros filtros o términos de búsqueda</p>
                    </div>
                `;
                return;
            }

            grid.innerHTML = productos.map(producto => crearHTMLProducto(producto)).join('');

            grid.querySelectorAll('.product-add').forEach(btn => {
                btn.addEventListener('click', function() {
                    const productoId = this.dataset.id;
                    agregarAlCarrito(productoId);
                });
            });

            grid.querySelectorAll('.product-wishlist').forEach(btn => {
                btn.addEventListener('click', function() {
                    this.classList.toggle('active');
                    const icono = this.querySelector('i');
                    if (this.classList.contains('active')) {
                        icono.classList.remove('far');
                        icono.classList.add('fas');
                        storage.toast('Agregado a favoritos', 'success');
                    } else {
                        icono.classList.remove('fas');
                        icono.classList.add('far');
                    }
                });
            });

        }, 300);
    }

    function crearHTMLProducto(producto) {
        const precioOriginal = producto.precioOriginal ? 
            `<del>${storage.precio(producto.precioOriginal)}</del>` : '';
        
        const badge = producto.precioOriginal ? 
            `<span class="product-badge badge-pink">SALE</span>` : '';

        return `
            <article class="product-card">
                <div class="product-image">
                    ${badge}
                    <button class="product-wishlist"><i class="far fa-heart"></i></button>
                    <img src="${producto.imagen}" alt="${producto.nombre}">
                    <button class="product-add" data-id="${producto.id}">AÑADIR AL CARRITO</button>
                </div>
                <div class="product-info">
                    <span class="product-category">${producto.categoria.toUpperCase()}</span>
                    <h3 class="product-name">${producto.nombre}</h3>
                    <p class="product-material">${producto.material}</p>
                    <p class="product-price">
                        <strong>${storage.precio(producto.precio)}</strong> ${precioOriginal}
                    </p>
                </div>
            </article>
        `;
    }

    function configurarFiltros() {
        const select = document.getElementById('filtro-categoria');
        if (!select) return;

        select.addEventListener('change', function() {
            aplicarFiltros();
        });
    }

    function configurarBusqueda() {
        const input = document.getElementById('busqueda-input');
        const btn = document.getElementById('busqueda-btn');

        if (input && btn) {
            btn.addEventListener('click', function() {
                aplicarFiltros();
            });

            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    aplicarFiltros();
                }
            });
        }
    }

    function aplicarFiltros() {
        const categoria = document.getElementById('filtro-categoria')?.value || 'todas';
        const busqueda = document.getElementById('busqueda-input')?.value || '';

        renderizarProductos({ categoria, busqueda });
    }

    function agregarAlCarrito(productoId, cantidad = 1, talle = 'Único', color = null) {
        const productos = storage.obtener(storage.almacen.PRODUCTOS);
        const producto = productos.find(p => p.id === productoId);

        if (!producto) {
            storage.toast('Producto no encontrado', 'error');
            return;
        }

        const carrito = storage.obtener(storage.almacen.CARRITO) || [];
        
        const itemExistente = carrito.find(item => 
            item.productoId === productoId && 
            item.talle === talle && 
            item.color === color
        );

        if (itemExistente) {
            itemExistente.cantidad += cantidad;
        } else {
            const nuevoItem = {
                id: storage.generarId(),
                productoId: producto.id,
                nombre: producto.nombre,
                imagen: producto.imagen,
                precio: producto.precio,
                cantidad: cantidad,
                talle: talle,
                color: color || producto.colores[0],
                vendedorId: producto.vendedorId,
                vendedorNombre: producto.vendedorNombre
            };
            carrito.push(nuevoItem);
        }

        storage.guardar(storage.almacen.CARRITO, carrito);
        storage.toast('Producto agregado al carrito', 'success');
        actualizarContadorCarrito();
    }

    function actualizarContadorCarrito() {
        const contador = document.getElementById('cart-count');
        if (!contador) return;

        const carrito = storage.obtener(storage.almacen.CARRITO) || [];
        const total = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        contador.textContent = total;
        contador.style.display = total > 0 ? 'flex' : 'none';
    }

    function inicializarCarrito() {
        renderizarCarrito();
        configurarBotonesCarrito();
    }

    function renderizarCarrito() {
        const container = document.getElementById('carrito-items');
        if (!container) return;

        const carrito = storage.obtener(storage.almacen.CARRITO) || [];

        if (carrito.length === 0) {
            container.innerHTML = `
                <div class="cart-empty">
                    <i class="cart-empty-icon fas fa-shopping-bag"></i>
                    <h3 class="cart-empty-title">Tu carrito está vacío</h3>
                    <p class="cart-empty-desc">Descubre nuestros productos exclusivos</p>
                    <a href="catalogo.html" class="btn btn-primary">EXPLORAR CATÁLOGO</a>
                </div>
            `;
            return;
        }

        container.innerHTML = carrito.map(item => crearHTMLCarritoItem(item)).join('');

        container.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', function() {
                const itemId = this.dataset.id;
                eliminarDelCarrito(itemId);
            });
        });

        container.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const itemId = this.dataset.id;
                const accion = this.dataset.accion;
                actualizarCantidadCarrito(itemId, accion);
            });
        });

        actualizarResumenCarrito();
    }

    function crearHTMLCarritoItem(item) {
        return `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.imagen}" alt="${item.nombre}" class="cart-item-image">
                <div class="cart-item-info">
                    <div class="cart-item-header">
                        <h4 class="cart-item-name">${item.nombre}</h4>
                        <i class="cart-item-remove fas fa-trash" data-id="${item.id}"></i>
                    </div>
                    <p class="cart-item-details">Talle: ${item.talle} | Color</p>
                    <div class="cart-item-options">
                        <div class="cart-item-quantity">
                            <button class="quantity-btn" data-id="${item.id}" data-accion="restar">-</button>
                            <span>${item.cantidad}</span>
                            <button class="quantity-btn" data-id="${item.id}" data-accion="sumar">+</button>
                        </div>
                        <span class="cart-item-price">${storage.precio(item.precio * item.cantidad)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    function actualizarResumenCarrito() {
        const carrito = storage.obtener(storage.almacen.CARRITO) || [];
        
        const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        const envio = subtotal > 0 ? 15 : 0;
        const total = subtotal + envio;

        document.getElementById('cart-subtotal').textContent = storage.precio(subtotal);
        document.getElementById('cart-envio').textContent = storage.precio(envio);
        document.getElementById('cart-total').textContent = storage.precio(total);
    }

    function eliminarDelCarrito(itemId) {
        let carrito = storage.obtener(storage.almacen.CARRITO) || [];
        carrito = carrito.filter(item => item.id !== itemId);
        storage.guardar(storage.almacen.CARRITO, carrito);
        renderizarCarrito();
        actualizarContadorCarrito();
        storage.toast('Producto eliminado del carrito', 'info');
    }

    function actualizarCantidadCarrito(itemId, accion) {
        const carrito = storage.obtener(storage.almacen.CARRITO) || [];
        const item = carrito.find(i => i.id === itemId);

        if (item) {
            if (accion === 'sumar') {
                item.cantidad++;
            } else if (accion === 'restar' && item.cantidad > 1) {
                item.cantidad--;
            }
        }

storage.guardar(storage.almacen.CARRITO, carrito);
        renderizarCarrito();
        actualizarContadorCarrito();
    }
        let pasoActual = 1;
        const pasos = document.querySelectorAll('.checkout-step');
        const formularios = document.querySelectorAll('.checkout-form');

        mostrarPaso(1);

        window.siguientePaso = function() {
            if (validarPaso(pasoActual)) {
                pasoActual++;
                if (pasoActual > 5) {
                    completarPedido();
                } else {
                    mostrarPaso(pasoActual);
                }
            }
        };

        window.pasoAnterior = function() {
            pasoActual--;
            mostrarPaso(pasoActual);
        };

        function mostrarPaso(numero) {
            pasos.forEach((paso, index) => {
                paso.classList.remove('active', 'completed');
                if (index + 1 < numero) paso.classList.add('completed');
                if (index + 1 === numero) paso.classList.add('active');
            });

            formularios.forEach((form, index) => {
                form.classList.toggle('hidden', index + 1 !== numero);
            });
        }

        function validarPaso(numero) {
            if (numero === 2) {
                const nombre = document.getElementById('checkout-nombre').value.trim();
                const email = document.getElementById('checkout-email').value.trim();
                const telefono = document.getElementById('checkout-telefono').value.trim();

                if (!nombre || !email || !telefono) {
                    storage.toast('Por favor completa todos los campos', 'error');
                    return false;
                }
            }
            return true;
        }

        const btnSubmit = document.getElementById('btn-confirmar-pedido');
        if (btnSubmit) {
            btnSubmit.addEventListener('click', function() {
                window.siguientePaso();
            });
        }
    }

    function completarPedido() {
        const sesion = storage.obtenerSesion();
        const carrito = storage.obtener(storage.almacen.CARRITO) || [];

        if (carrito.length === 0) {
            storage.toast('Tu carrito está vacío', 'error');
            return;
        }

        const nombre = document.getElementById('checkout-nombre').value.trim();
        const email = document.getElementById('checkout-email').value.trim();
        const telefono = document.getElementById('checkout-telefono').value.trim();
        const region = document.getElementById('checkout-region').value;
        const ciudad = document.getElementById('checkout-ciudad').value.trim();
        const distrito = document.getElementById('checkout-distrito').value.trim();
        const codigoPostal = document.getElementById('checkout-codigo').value.trim();
        const referencia = document.getElementById('checkout-referencia').value.trim();
        const metodopago = document.querySelector('input[name="pago"]:checked')?.value || 'tarjeta';

        const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        const envio = storage.costoEnvio(region);
        const total = subtotal + envio;

        const nuevoPedido = {
            id: storage.generarId(),
            codigoPedido: storage.codigoPedido(),
            codigoSeguimiento: storage.codigoSeg(),
            compradorId: sesion.id,
            compradorNombre: nombre,
            compradorEmail: email,
            items: [...carrito],
            total: total,
            envio: envio,
            estado: storage.estados.ORIGEN,
            metodopago: metodopago,
            direccion: {
                region: region,
                ciudad: ciudad,
                distrito: distrito,
                codigoPostal: codigoPostal,
                referencia: referencia
            },
            fechaPedido: storage.fecha(),
            fechaEstimada: storage.agregarDias(storage.fecha(), 7),
            vendedorId: carrito[0]?.vendedorId,
            vendedorNombre: carrito[0]?.vendedorNombre
        };

        const pedidos = storage.obtener(storage.almacen.PEDIDOS) || [];
        pedidos.push(nuevoPedido);
        storage.guardar(storage.almacen.PEDIDOS, pedidos);

        storage.guardar(storage.almacen.CARRITO, []);

        localStorage.setItem('apu_ultimo_pedido', nuevoPedido.codigoPedido);

        window.location.href = 'confirmacion.html';
    }

    function inicializarSeguimiento() {
        const formulario = document.getElementById('form-seguimiento');
        
        if (formulario) {
            formulario.addEventListener('submit', function(e) {
                e.preventDefault();
                buscarPedido();
            });
        }

        const buscarBtn = document.getElementById('btn-buscar');
        if (buscarBtn) {
            buscarBtn.addEventListener('click', buscarPedido);
        }
    }

    function buscarPedido() {
        const codigo = document.getElementById('input-codigo').value.trim();
        
        if (!codigo) {
            storage.toast('Por favor ingresa un código de pedido', 'error');
            return;
        }

        const pedidos = storage.obtener(storage.almacen.PEDIDOS) || [];
        const pedido = pedidos.find(p => 
            p.codigoPedido === codigo || p.codigoSeguimiento === codigo
        );

        if (!pedido) {
            storage.toast('Pedido no encontrado', 'error');
            return;
        }

        renderizarSeguimiento(pedido);
    }

    function renderizarSeguimiento(pedido) {
        const container = document.getElementById('seguimiento-resultado');
        if (!container) return;

        const estados = Object.values(storage.estados);
        const estadoActual = estados.indexOf(pedido.estado);

        container.innerHTML = `
            <div class="seguimiento-card">
                <div class="seguimiento-status">
                    <h3 class="seguimiento-status-title">Pedido: ${pedido.codigoPedido}</h3>
                    <span class="seguimiento-badge badge-success">${pedido.estado}</span>
                </div>
                
                <div class="seguimiento-steps">
                    ${estados.map((estado, index) => `
                        <div class="seguimiento-step ${index <= estadoActual ? 'active' : ''} ${index < estadoActual ? 'completed' : ''}">
                            <div class="seguimiento-step-icon">
                                <i class="fas ${index < estadoActual ? 'fa-check' : index === estadoActual ? 'fa-circle' : 'fa-circle'}"></i>
                            </div>
                            <span class="seguimiento-step-label">${estado}</span>
                        </div>
                    `).join('')}
                </div>

                <div class="seguimiento-details">
                    <div class="seguimiento-detail">
                        <span class="seguimiento-detail-label">Ciudad de Origen</span>
                        <span class="seguimiento-detail-value">Cusco</span>
                    </div>
                    <div class="seguimiento-detail">
                        <span class="seguimiento-detail-label">Ciudad de Destino</span>
                        <span class="seguimiento-detail-value">${pedido.direccion.ciudad}</span>
                    </div>
                    <div class="seguimiento-detail">
                        <span class="seguimiento-detail-label">Cliente</span>
                        <span class="seguimiento-detail-value">${pedido.compradorNombre}</span>
                    </div>
                    <div class="seguimiento-detail">
                        <span class="seguimiento-detail-label">Total</span>
                        <span class="seguimiento-detail-value">${storage.precio(pedido.total)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    function inicializarMiCuenta() {
        const sesion = storage.obtenerSesion();
        
        document.getElementById('cuenta-nombre').textContent = sesion.nombre;
        document.getElementById('cuenta-email').textContent = sesion.email;

        renderizarPedidos();
    }

    function renderizarPedidos() {
        const container = document.getElementById('pedidos-lista');
        if (!container) return;

        const sesion = storage.obtenerSesion();
        const pedidos = storage.obtener(storage.almacen.PEDIDOS) || [];
        const pedidosUsuario = pedidos.filter(p => p.compradorId === sesion.id);

        if (pedidosUsuario.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="empty-state-icon fas fa-box-open"></i>
                    <h3 class="empty-state-title">No tienes pedidos aún</h3>
                    <p class="empty-state-desc">Explora nuestro catálogo y realiza tu primera compra</p>
                    <a href="catalogo.html" class="btn btn-primary">VER CATÁLOGO</a>
                </div>
            `;
            return;
        }

        container.innerHTML = pedidosUsuario.map(pedido => `
            <div class="orden-card">
                <div class="orden-info">
                    <h4 class="orden-id">${pedido.codigoPedido}</h4>
                    <p class="orden-fecha">${new Date(pedido.fechaPedido).toLocaleDateString('es-PE')}</p>
                </div>
                <span class="orden-total">${storage.precio(pedido.total)}</span>
                <span class="orden-status badge-success">${pedido.estado}</span>
                <a href="seguimiento-privado.html?codigo=${pedido.codigoPedido}" class="btn btn-sm btn-outline-dark">Ver Seguimiento</a>
            </div>
        `).join('');
    }

    window.CompradorUtils = {
        agregarCarrito: agregarAlCarrito,
        eliminarCarrito: eliminarDelCarrito,
        actualizarCantidad: actualizarCantidadCarrito,
        buscarPedido: buscarPedido
    };

})();