import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors} from 'middy/middlewares'
import { updateTodoItem } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { createLogger } from '../../utils/logger'

const logger = createLogger('todos');
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {    
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

    const isExist = await updateTodoItem(event, updatedTodo);
    console.log("Check existing" + isExist);
    logger.info("Check existing" + isExist);
    // check todo item is existing or not first
    if (!isExist) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'ERROR, this todo item not found'
        })
      };
    }
    logger.info("Todo item has been updated");
    // then update it
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({})
    }
  })


  handler  
  .use(
    cors({
      credentials: true
    })
  )
