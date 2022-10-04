import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodoItem } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('todos');
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)

    if(!newTodo.name)
    {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'ERROR: The name is empty.'
        })
      };
    }

    const todo = await createTodoItem(event, newTodo);
    logger.info("Todo item has been created");
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
  
      body: JSON.stringify({
        item: todo
      })
    };
  })

handler.use(
  cors({
    credentials: true
  })
)