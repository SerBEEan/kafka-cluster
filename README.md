# kafka-cluster
Запускает в docker-контейнерах zookeeper, три экземпляра kafka, скрипты администратора, consumer и producer для обмена сообщениями, через kafka

## Запуск
Через `docker-compose` запустить все контейнеры
```
docker-compose up
```

Далее, оставьте выполняться текущий процесс в текущем терминале и откройте еще три

Результат команды `docker ps` должен быть такой (т.е. 7 запущенных контейнеров)
```
CONTAINER ID   IMAGE                              COMMAND                  CREATED         STATUS         PORTS                                        NAMES
73659fc97c12   kafka-cluster_producer             "docker-entrypoint.s…"   2 minutes ago   Up 2 minutes                                                producer
3dfeccef0fda   kafka-cluster_consumer             "docker-entrypoint.s…"   2 minutes ago   Up 2 minutes                                                consumer
432ff3298e82   kafka-cluster_admin                "docker-entrypoint.s…"   2 minutes ago   Up 2 minutes                                                admin
89b80f044b8e   confluentinc/cp-kafka:latest       "/etc/confluent/dock…"   2 minutes ago   Up 2 minutes   0.0.0.0:29092->9092/tcp                      kafka2
44f214506fb1   confluentinc/cp-kafka:latest       "/etc/confluent/dock…"   2 minutes ago   Up 2 minutes   0.0.0.0:19092->9092/tcp                      kafka1
fa15573df307   confluentinc/cp-kafka:latest       "/etc/confluent/dock…"   2 minutes ago   Up 2 minutes   0.0.0.0:39092->9092/tcp                      kafka3
7b47ee471b49   confluentinc/cp-zookeeper:latest   "/etc/confluent/dock…"   2 minutes ago   Up 2 minutes   2888/tcp, 0.0.0.0:2181->2181/tcp, 3888/tcp   zookeeper
```

## Создание топиков 
Взаимодействие с kafka будет осуществляться через admin-скрипты \
Зайдите в контейнер `admin`
```
docker exec -it admin bash
```

Создайте два топика
```
node admin --create-topic=messages
node admin --create-topic=dead_letter
```

Посмотрите вывод всех топиков
```
node admin --get-list

// [ 'dead_letter', 'messages' ]
```

## Включаем consumer
Заходим в контейнер `consumer`
```
docker exec -it consumer bash
```

Запускаем слушателя
```
node consumer
```

## Отправляем сообщения
Заходим в контейнер `producer`
```
docker exec -it producer bash
```

Отправим сообщения через скрипт
```
// попадет в топик messages
node producer send=message

// все кроме message попадет в топик dead_letter
node producer send=error
node producer send=some
```

Перейдем в терминал с выводом `consumer`
```
// consumer

Done! { type: 'message' }

Отправил в error

Отправил в error
```

## Прочитать из топика dead_letter
В терминале с `consumer`, останавливаем процесс слушателя `Ctrl + C` \
В файле `consumer.js` необходимо подредактировать код слушателя
```
// consumer.js

const start = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'dead_letter', fromBeginning: true });        // <-- тут изменить название топика на dead_letter

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const data = JSON.parse(message.value.toString());

        // For dead_letter
        console.log(data);                                                          // <-- тут снять комментарий

        / *                                                                         // <-- этот блок условия полностью закомментировать 
        if (data.type === 'message') {
          console.log('\nDone!', data);
        } else {
          await producer.connect();

          await producer.send({
            topic: 'dead_letter',
            messages: [
              { value: JSON.stringify(data) },
            ],
          });

          await producer.disconnect();
          console.log('\nОтправил в error');
        }
        */
      },
    })
};
``` 

После, запустив слушателя (__дайте ему время загрузиться__, секунд 30), ожидайте увидеть следующее
```
node consumer

// Вывод

{ type: 'error' }
{ type: 'some' }
```