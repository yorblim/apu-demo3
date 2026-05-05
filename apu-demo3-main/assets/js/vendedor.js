/* =======================================================
   VENDEDOR.JS - Dashboard del Vendedor
   ======================================================= */

(function() {
    const storage = window.StorageUtils;

    document.addEventListener('DOMContentLoaded', function() {
        if (!storage.verificarVendedor()) return;

        if (document.getElementById('dashboard-page')) {
            inicializarDashboard();
        }

        if (document.getElementById('productos-page')) {
            inicializarProductos();
        }

        if (document.getElementById('inventario-page')) {
            inicializarInventario();
        }

        if (document.getElementById('pedidos-page')) {
            inicializarPedidos();
        }

        if (document.getElementById('perfil-page')) {
            inicializarPerfil();
        }
    });

    function inicializarDashboard() {
        renderizarEstadisticas();
    }

    function renderizarEstadisticas() {
        const sesion = storage.obtenerSesion();
        const productos = storage.obtener(storage.almacen.PRODUCTOS) || [];
        const pedidos = storage.obtener(storage.almacen.PEDIDOS) || [];

        const productosVendedor = productos.filter(p => p.vendedorId === sesion.id);
        const pedidosVendedor = pedidos.filter(p => p.vendedorId === sesion.id);

        const ventasTotales = pedidosVendedor.reduce((sum, p) => sum + p.total, 0);
        const pedidosMes = pedidosVendedor.filter(p => {
            const fecha = new Date(p.fechaPedido);
            const ahora = new Date();
            return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
        });

        document.getElementById('stat-ventas').textContent = storage.precio(ventasTotales);
        document.getElementById('stat-pedidos').textContent = pedidosVendedor.length;
        document.getElementById('stat-productos').textContent = productosVendedor.length;
        document.getElementById('stat-clientes').textContent = new Set(pedidosVendedor.map(p => p.compradorId)).size;

        document.getElementById('stat-ventas-mes').textContent = pedidosMes.length + ' pedidos';
    }

    function inicializarProductos() {
        renderizarListaProductos();
        configurarModalProducto();
    }

    function renderizarListaProductos(filtros = {}) {
        const tbody = document.getElementById('productos-tabla');
        if (!tbody) return;

        storage.loader(tbody, 'Cargando productos...');

        setTimeout(function() {
            const productos = storage.obtener(storage.almacen.PRODUCTOS) || [];
            
            let productosFiltrados = productos;

            if (filtros.categoria && filtros.categoria !== 'todas') {
                productosFiltrados = productosFiltrados.filter(p => p.categoria === filtros.categoria);
            }

            if (filtros.estado && filtros.estado !== 'todos') {
                productosFiltrados = productosFiltrados.filter(p => p.estado === filtros.estado);
            }

            if (productosFiltrados.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 40px;">
                            <i class="fas fa-box-open" style="font-size: 40px; color: #E5E7EB; margin-bottom: 15px;"></i>
                            <p>No hay productos</p>
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = productosFiltrados.map(producto => `
                <tr>
                    <td>
                        <div class="table-producto">
                            <img src="${producto.imagen}" alt="${producto.nombre}" class="table-producto-img">
                            <div class="table-producto-info">
                                <div class="table-producto-nombre">${producto.nombre}</div>
                                <div class="table-producto-categoria">${producto.categoria}</div>
                            </div>
                        </div>
                    </td>
                    <td>${producto.stock}</td>
                    <td>${storage.precio(producto.precio)}</td>
                    <td>
                        <span class="table-status ${producto.estado === 'activo' ? 'active' : 'inactive'}">
                            ${producto.estado}
                        </span>
                    </td>
                    <td>
                        <div class="table-acciones">
                            <button onclick="abrirModalEditar('${producto.id}')" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="eliminarProducto('${producto.id}')" title="Eliminar" class="delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');

        }, 300);
    }

    function configurarModalProducto() {
        const btnAbrir = document.getElementById('btn-abrir-modal');
        const modal = document.getElementById('modal-producto');
        const cerrar = document.getElementById('cerrar-modal');
        const formulario = document.getElementById('form-producto');

        if (btnAbrir && modal) {
            btnAbrir.addEventListener('click', function() {
                modal.classList.add('active');
                formulario.reset();
                document.getElementById('modal-titulo').textContent = 'Agregar Producto';
                document.getElementById('producto-id').value = '';
            });
        }

        if (cerrar && modal) {
            cerrar.addEventListener('click', function() {
                modal.classList.remove('active');
            });
        }

        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        }

        if (formulario) {
            formulario.addEventListener('submit', function(e) {
                e.preventDefault();
                guardarProducto();
            });
        }
    }

    window.abrirModalEditar = function(productoId) {
        const productos = storage.obtener(storage.almacen.PRODUCTOS);
        const producto = productos.find(p => p.id === productoId);

        if (!producto) return;

        document.getElementById('modal-titulo').textContent = 'Editar Producto';
        document.getElementById('producto-id').value = producto.id;
        document.getElementById('producto-nombre').value = producto.nombre;
        document.getElementById('producto-categoria').value = producto.categoria;
        document.getElementById('producto-precio').value = producto.precio;
        document.getElementById('producto-stock').value = producto.stock;
        document.getElementById('producto-material').value = producto.material;
        document.getElementById('producto-descripcion').value = producto.descripcion;

        document.getElementById('modal-producto').classList.add('active');
    };

    function guardarProducto() {
        const sesion = storage.obtenerSesion();
        const id = document.getElementById('producto-id').value;
        const nombre = document.getElementById('producto-nombre').value.trim();
        const categoria = document.getElementById('producto-categoria').value;
        const precio = parseFloat(document.getElementById('producto-precio').value);
        const stock = parseInt(document.getElementById('producto-stock').value);
        const material = document.getElementById('producto-material').value.trim();
        const descripcion = document.getElementById('producto-descripcion').value.trim();

        if (!nombre || !categoria || !precio || !stock) {
            storage.toast('Por favor completa todos los campos', 'error');
            return;
        }

        const productos = storage.obtener(storage.almacen.PRODUCTOS) || [];

        if (id) {
            const index = productos.findIndex(p => p.id === id);
            if (index !== -1) {
                productos[index] = {
                    ...productos[index],
                    nombre,
                    categoria,
                    precio,
                    stock,
                    material,
                    descripcion
                };
            }
            storage.toast('Producto actualizado', 'success');
        } else {
            const nuevoProducto = {
                id: storage.generarId(),
                nombre,
                categoria,
                precio,
                precioOriginal: null,
                material,
                descripcion,
                imagen: 'image/chica-joven-poncho-andino-rojo.jpg',
                colores: ['#1A1A1A'],
                talles: ['Único'],
                stock,
                vendedorId: sesion.id,
                vendedorNombre: sesion.nombre,
                fechaPublicacion: storage.fecha(),
                estado: 'activo'
            };
            productos.push(nuevoProducto);
            storage.toast('Producto agregado', 'success');
        }

        storage.guardar(storage.almacen.PRODUCTOS, productos);
        document.getElementById('modal-producto').classList.remove('active');
        renderizarListaProductos();
    }

    window.eliminarProducto = function(productoId) {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;

        let productos = storage.obtener(storage.almacen.PRODUCTOS) || [];
        productos = productos.filter(p => p.id !== productoId);
        storage.guardar(storage.almacen.PRODUCTOS, productos);
        
        storage.toast('Producto eliminado', 'info');
        renderizarListaProductos();
    };

    function inicializarInventario() {
        const sesion = storage.obtenerSesion();
        const productos = storage.obtener(storage.almacen.PRODUCTOS) || [];
        const productosVendedor = productos.filter(p => p.vendedorId === sesion.id);

        const totalStock = productosVendedor.reduce((sum, p) => sum + p.stock, 0);
        const stockBajo = productosVendedor.filter(p => p.stock < 10).length;
        const sinStock = productosVendedor.filter(p => p.stock === 0).length;

        document.getElementById('inv-total').textContent = totalStock;
        document.getElementById('inv-bajo').textContent = stockBajo;
        document.getElementById('inv-agotado').textContent = sinStock;
    }

    function inicializarPedidos() {
        renderizarListaPedidos();
    }

    function renderizarListaPedidos() {
        const tbody = document.getElementById('pedidos-tabla');
        if (!tbody) return;

        const sesion = storage.obtenerSesion();
        const pedidos = storage.obtener(storage.almacen.PEDIDOS) || [];
        const pedidosVendedor = pedidos.filter(p => p.vendedorId === sesion.id);

        if (pedidosVendedor.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px;">
                        <i class="fas fa-box-open" style="font-size: 40px; color: #E5E7EB; margin-bottom: 15px;"></i>
                        <p>No hay pedidos</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = pedidosVendedor.map(pedido => `
            <tr>
                <td>
                    <div class="table-producto">
                        <div class="table-producto-info">
                            <div class="table-producto-nombre">${pedido.codigoPedido}</div>
                            <div class="table-producto-categoria">${new Date(pedido.fechaPedido).toLocaleDateString('es-PE')}</div>
                        </div>
                    </div>
                </td>
                <td>${pedido.compradorNombre}</td>
                <td>${pedido.items.length} artículo(s)</td>
                <td>${storage.precio(pedido.total)}</td>
                <td>
                    <span class="table-status ${pedido.estado === 'Entregado' ? 'active' : pedido.estado === 'En Tránsito' ? 'pending' : 'pending'}">
                        ${pedido.estado}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-dark" onclick="abrirModalPedido('${pedido.id}')">
                        Ver Detalles
                    </button>
                </td>
            </tr>
        `).join('');
    }

    window.abrirModalPedido = function(pedidoId) {
        const pedidos = storage.obtener(storage.almacen.PEDIDOS) || [];
        const pedido = pedidos.find(p => p.id === pedidoId);

        if (!pedido) return;

        const modal = document.getElementById('modal-pedido');
        const contenido = document.getElementById('modal-pedido-contenido');

        const itemsHTML = pedido.items.map(item => `
            <div style="display: flex; gap: 15px; padding: 10px 0; border-bottom: 1px solid #EEE;">
                <img src="${item.imagen}" alt="${item.nombre}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: #1A1A1A;">${item.nombre}</div>
                    <div style="font-size: 12px; color: #666;">Cantidad: ${item.cantidad} | Talle: ${item.talle}</div>
                </div>
                <div style="font-weight: 600; color: #1A1A1A;">${storage.precio(item.precio * item.cantidad)}</div>
            </div>
        `).join('');

        contenido.innerHTML = `
            <div style="margin-bottom: 20px;">
                <h4 style="color: #1A1A1A; margin-bottom: 5px;">${pedido.codigoPedido}</h4>
                <p style="font-size: 13px; color: #666;">${new Date(pedido.fechaPedido).toLocaleString('es-PE')}</p>
            </div>
            
            <div style="margin-bottom: 20px; padding: 15px; background: #F9FAFB; border-radius: 8px;">
                <h5 style="font-size: 12px; color: #666; margin-bottom: 10px;">DATOS DEL CLIENTE</h5>
                <p style="font-size: 14px; color: #1A1A1A;">${pedido.compradorNombre}</p>
                <p style="font-size: 13px; color: #666;">${pedido.direccion.ciudad}, ${pedido.direccion.distrito}</p>
            </div>

            <div style="margin-bottom: 20px;">
                <h5 style="font-size: 12px; color: #666; margin-bottom: 10px;">PRODUCTOS</h5>
                ${itemsHTML}
            </div>

            <div style="display: flex; justify-content: space-between; padding: 15px 0; border-top: 1px solid #EEE;">
                <span style="font-weight: 600; color: #1A1A1A;">Total:</span>
                <span style="font-weight: 700; color: #1A1A1A; font-size: 18px;">${storage.precio(pedido.total)}</span>
            </div>

            <div style="margin-top: 20px;">
                <label style="font-size: 12px; color: #666; margin-bottom: 8px; display: block;">ACTUALIZAR ESTADO</label>
                <select id="nuevo-estado-pedido" class="form-select" style="width: 100%;">
                    <option value="Origen" ${pedido.estado === 'Origen' ? 'selected' : ''}>Origen</option>
                    <option value="En Tránsito" ${pedido.estado === 'En Tránsito' ? 'selected' : ''}>En Tránsito</option>
                    <option value="Destino" ${pedido.estado === 'Destino' ? 'selected' : ''}>Destino</option>
                    <option value="Entregado" ${pedido.estado === 'Entregado' ? 'selected' : ''}>Entregado</option>
                </select>
                <button class="btn btn-primary" style="width: 100%; margin-top: 15px;" onclick="actualizarEstadoPedido('${pedido.id}')">
                    ACTUALIZAR ESTADO
                </button>
            </div>
        `;

        modal.classList.add('active');
    };

    window.actualizarEstadoPedido = function(pedidoId) {
        const nuevoEstado = document.getElementById('nuevo-estado-pedido').value;
        
        const pedidos = storage.obtener(storage.almacen.PEDIDOS) || [];
        const index = pedidos.findIndex(p => p.id === pedidoId);

        if (index !== -1) {
            pedidos[index].estado = nuevoEstado;
            storage.guardar(storage.almacen.PEDIDOS, pedidos);
            
            storage.toast('Estado actualizado a: ' + nuevoEstado, 'success');
            document.getElementById('modal-pedido').classList.remove('active');
            renderizarListaPedidos();
        }
    };

    function inicializarPerfil() {
        const sesion = storage.obtenerSesion();
        
        document.getElementById('perfil-nombre').textContent = sesion.nombre;
        document.getElementById('perfil-email').textContent = sesion.email;
        document.getElementById('perfil-fecha').textContent = new Date(sesion.fechaLogin).toLocaleDateString('es-PE');

        const formulario = document.getElementById('form-perfil');
        if (formulario) {
            formulario.addEventListener('submit', function(e) {
                e.preventDefault();
                guardarPerfil();
            });
        }
    }

    function guardarPerfil() {
        const nombreTienda = document.getElementById('tienda-nombre').value.trim();
        const descripcion = document.getElementById('tienda-descripcion').value.trim();
        const categoria = document.getElementById('tienda-categoria').value;

        if (!nombreTienda || !descripcion) {
            storage.toast('Por favor completa todos los campos obligatorios', 'error');
            return;
        }

        const sesion = storage.obtenerSesion();
        const vendedores = storage.obtener(storage.almacen.VENDEDORES) || [];
        
        let index = vendedores.findIndex(v => v.usuarioId === sesion.id);
        
        if (index === -1) {
            vendedores.push({
                id: storage.generarId(),
                usuarioId: sesion.id,
                nombreTienda,
                descripcion,
                categoria,
                fechaCreacion: storage.fecha(),
                estado: 'activo'
            });
        } else {
            vendedores[index] = {
                ...vendedores[index],
                nombreTienda,
                descripcion,
                categoria
            };
        }

        storage.guardar(storage.almacen.VENDEDORES, vendedores);
        storage.toast('Perfil guardado correctamente', 'success');
    }

    const cerrarModal = document.getElementById('cerrar-modal-pedido');
    if (cerrarModal) {
        cerrarModal.addEventListener('click', function() {
            document.getElementById('modal-pedido').classList.remove('active');
        });
    }

})();