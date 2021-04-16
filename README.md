# express-locallibrary-tutorial
Exemplo de um sistema de biblioteca com o framework Express (Node)

Eu fiz este projeto completo dentro de outro projeto, [express-learning]. Para ver todo o meu progresso de desenvolvimento, acesse [este link].

## TESTANDO

Na raiz do projeto, execute o comando ```npm install``` para instalar todas as dependências.

Configure seu banco de dados MongoDB para poder conectar o programa, e exporte a variável MONGODB_URI com a string de conexão:

```export MONGODB_URI="mongodb+srv://usuario:senha@servidor:porta/nome_do_bd?retryWrites=true&w=majority"```

Eu utilizei o MongoDB Atlas para este fim.

E, finalmente, rode o app com: ```DEBUG=locallib:* npm start```

## ACESSE O APP HOSPEDADO COM HEROKU
[Local Library](https://leshto-locallib.herokuapp.com/catalog/)


por Ledso!

[express-learning]: https://github.com/cledsupper/express-learning
[este link]: https://github.com/cledsupper/express-learning/commits/main/express/locallib
