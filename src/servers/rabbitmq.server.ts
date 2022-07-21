import {Context} from "@loopback/context";
import {Server} from "@loopback/core";
import {Channel, connect, Connection, Options, Replies} from 'amqplib';
import AssertQueue = Replies.AssertQueue;
import AssertExchange = Options.AssertExchange;

export class RabbitmqServer extends Context implements Server {
    private _listening: boolean;

    conn: Connection

    async start(): Promise<void> {
        this.conn = await connect({
            hostname: 'rabbitmq',
            username: 'admin',
            password: 'admin'
        });
        this._listening = true;
        this.boot();
    }

    async boot() {
        const channel: Channel = await this.conn.createChannel();
        const queue: AssertQueue = await channel.assertQueue('transaction-queue');
        // const exchange: AssertExchange = await channel.assertExchange('amq.direct', 'direct');

        // channel.publish('amq.direct', 'transaction-routing-key', Buffer.from('teste'));

        //enviar dados para a fila
        // const result = channel.sendToQueue('transaction-queue', Buffer.from('Olá mundo!'))

        //consumir itens da fila
        channel.consume(queue.queue, (message)=>{
            console.log(message?.content.toString())
        });

        const queueCustomer: AssertQueue = await channel.assertQueue('customer-queue');

        channel.consume(queueCustomer.queue, (message)=>{
            console.log(message?.content.toString())
        });

        // console.log(result);
    }


    async stop(): Promise<void> {
        await this.conn.close();
        this._listening = false;
    }

    get listening(): boolean{
        return this._listening;
    }

}