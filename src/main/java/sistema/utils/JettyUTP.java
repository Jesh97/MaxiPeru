package sistema.utils;

import jakarta.servlet.Servlet;
import org.eclipse.jetty.server.Connector;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ServerConnector;
import org.eclipse.jetty.servlet.DefaultServlet;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;

public class JettyUTP {

    private Server server;
    private int port;
    private String static_path;
    private ServletContextHandler context;

    public JettyUTP(int port, String static_path) {
        this.port = port;
        this.static_path = static_path;
        this.server = new Server(port);

        Connector connector = new ServerConnector(this.server);
        this.server.addConnector(connector);

        this.context = getContextWebApp(this.port, this.static_path);
    }

    // Habilita sesiones en el contexto
    private static ServletContextHandler getContextWebApp(int port, String path) {
        // Crear contexto con soporte para sesiones
        ServletContextHandler context = new ServletContextHandler(ServletContextHandler.SESSIONS);
        context.setContextPath("/");

        // Configurar DefaultServlet para archivos estáticos
        ServletHolder servletHolderStatic = context.addServlet(DefaultServlet.class, "/");
        servletHolderStatic.setInitParameter("resourceBase", path);
        servletHolderStatic.setAsyncSupported(true);

        return context;
    }

    public ServletHolder addServlet(Class<? extends Servlet> servlet, String path) {
        return context.addServlet(servlet, path);
    }

    public void start() throws Exception {
        // Asignar el contexto con sesiones habilitadas
        this.server.setHandler(this.context);
        this.server.start();
    }
}
