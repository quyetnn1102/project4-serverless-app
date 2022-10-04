import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors} from 'middy/middlewares'
import { deleteTodoItem } from '../../businessLogic/todos'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {    

    const isExist = await deleteTodoItem(event);
    if (!isExist) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'ERROR, this todo item not found'
        })
      };
    }
    
    return {
      statusCode: 202,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({})
    };
    return undefined
  }
)

handler  
  .use(
    cors({
      credentials: true
    })
  )