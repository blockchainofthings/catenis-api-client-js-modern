/**
 * Created by claudio on 2022-12-16
 */
import { WebSocket } from 'ws';

if (!global.WebSocket) {
    global.WebSocket = WebSocket;
}
