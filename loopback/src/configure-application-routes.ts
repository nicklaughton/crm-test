import { ADApplication } from './application';
import path from 'path';

// whitelist angular routes for improved SEO
export default function configureApplicationRoutes(app: ADApplication) {
    if (process.env.enable404Routing === 'true') {
        app.static(
            /\/(home\/projects\/.*|companies\/.*|contacts\/.*|verifyEmail|loginError|contacts|logout|logIn|home)/,
            path.join(__dirname, '../client/index.html'),
            {
                redirect: false,
            }
        );

        // send any other non-api pages back to the 404 page
        app.static(
            /^(?!\/api)^(?!\/explorer)^(?!\/apexDesigner).+/,
            path.join(__dirname, '../assets/404.html'),
            {
                redirect: false,
                setHeaders: (res) => {
                    res.statusCode = 404;
                },
            }
        );
    } else {
        // send non-api pages back to the angular index so direct angular routes work
        app.static(
            /^(?!\/api)^(?!\/explorer).+/,
            path.join(__dirname, '../client/index.html'),
            { redirect: false }
        );
    }
}
