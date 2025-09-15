# **📄 Sistema de Gestión de Inventario**

Este proyecto es un sistema de gestión de inventario robusto y modular, diseñado para manejar de forma eficiente el inventario, las compras y las ventas de productos de limpieza. El sistema incluye un completo módulo de gestión de usuarios para un control de acceso seguro y flexible.

🚀 Características Clave
📦 Gestión de Inventario en Tiempo Real: Controla el stock, añadiendo, editando, eliminando y consultando productos con facilidad.

📈 Control de Transacciones: Registra minuciosamente todas las compras a proveedores y las ventas a clientes.

💰 Bonificaciones y Descuentos: Permite aplicar bonificaciones y descuentos en las ventas para una gestión comercial más flexible.

📄 Generación de Documentos Oficiales: Crea automáticamente boletas, facturas y guías de transporte en formato PDF, cumpliendo con los requisitos para un registro contable adecuado.

👤 Gestión de Usuarios con Roles: Administra diferentes roles (como Administrador, Vendedor, Almacenista) para controlar el acceso a funcionalidades específicas del sistema.

🔗 Conexión a Múltiples Bases de Datos: Compatible con MySQL, MariaDB, SQL Server y SQLite, gracias a la inclusión de múltiples conectores.

⚙️ Tecnologías Utilizadas
Backend: Java Servlets para la lógica de negocio y Maven como gestor de dependencias.

Arquitectura: Patrón MVC (Modelo-Vista-Controlador) para una separación de responsabilidades clara.

Base de Datos: Usa un pool de conexiones (C3P0) para un rendimiento óptimo.

Documentación y Códigos: iText para generar PDFs y qrgen para códigos QR.

Manejo de Datos: Gson y Jackson para la serialización y deserialización de datos JSON.

Servidor de Aplicaciones: Jetty integrado en la configuración de Maven.

🛠️ Configuración e Instalación
Clona el repositorio:

Bash

git clone https://github.com/tu-usuario/SistemaMaxiPeru.git
cd SistemaMaxiPeru
Configura la Base de Datos:

Crea una base de datos y ejecuta el script SQL (database.sql) para crear las tablas necesarias.

Asegúrate de configurar las credenciales de conexión en el archivo src/main/resources/db.properties.

Compila el proyecto:

Bash

mvn clean package
Esto generará un archivo SistemaMaxiPeru.war en el directorio target/.

Despliega la aplicación:

Copia el archivo .war en el directorio de despliegue de tu servidor web (por ejemplo, en la carpeta webapps de Tomcat).

Inicia el servidor de aplicaciones. La aplicación estará accesible en http://localhost:8080/SistemaMaxiPeru.

🤝 Guía para Desarrolladores
Estructura del Proyecto: Sigue el patrón MVC. Los Servlets (controlador/) manejan las solicitudes, las clases DAO (modelo/) se encargan de la interacción con la base de datos y los archivos JSP (webapp/) son las vistas de usuario.

Dependencias: Todas las dependencias están gestionadas en el archivo pom.xml. Si necesitas una nueva librería, agrégala aquí y Maven se encargará del resto.

📄 Licencia
Este proyecto se distribuye bajo la Licencia MIT. Puedes consultar el archivo LICENSE.md para más detalles.

📧 Contacto
Para cualquier duda o sugerencia, puedes abrir un issue en este repositorio o contactar al desarrollador en [victorcabanillas090401@gmail.com].
