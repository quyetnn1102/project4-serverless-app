import 'source-map-support/register';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { getUserId } from '../lambda/utils';
import { TodosAccess } from '../dataLayer/todosAccess'
import { TodosStorage } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

const todoAccess = new TodosAccess();
const todosStorage = new TodosStorage();
const logger = createLogger('todos');

// create todo item
export async function createTodoItem(event: APIGatewayProxyEvent, createTodoRequest: CreateTodoRequest): Promise<TodoItem> {
    const todoId = uuid.v4();
    const userId = getUserId(event);
    const createdAt = new Date(Date.now()).toISOString();
    const bucketName = await todosStorage.getBucketName();

    const todoItem = {
        userId,
        todoId,
        createdAt,
        done: false,
        attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`,
        ...createTodoRequest
    };
    console.log('createTodoItem userId: ' + userId + " todoId: "+userId +" bucketname: " +bucketName )
    logger.info('createTodoItem userId: ' + userId + " todoId:" + userId + " bucketname: " +bucketName );
    await todoAccess.addTodoItem(todoItem);

    return todoItem;
}

// get todo item by todoId
export async function getTodoItem(event: APIGatewayProxyEvent) {
    const todoId = event.pathParameters.todoId;
    const userId = getUserId(event);
    console.log('getTodoItem userId: ' + userId + " todoId: "+todoId );
    return await todoAccess.getTodoItem(todoId, userId);
}

// get all todo items by userId
export async function getTodoItems(event: APIGatewayProxyEvent) {
    const userId = getUserId(event);
    console.log('getTodoItems userId: ' + userId)
    logger.info('getTodoItems userId: ' + userId);
    return await todoAccess.getAllTodoItems(userId);
}

export async function updateTodoItem(event: APIGatewayProxyEvent,
    updateTodoRequest: UpdateTodoRequest) {
    const todoId = event.pathParameters.todoId;
    const userId = getUserId(event);
    logger.info('updateTodoItem userId: ' + userId);

    if (!(await todoAccess.getTodoItem(todoId, userId))) {
        return false;
    }
    console.log('updateTodoItem userId: ' + userId + " todoId: "+todoId );
    logger.info('updateTodoItem userId: ' + userId + " todoId: "+todoId );    
    await todoAccess.updateTodoItem(todoId, userId, updateTodoRequest);
    return true;
}

export async function deleteTodoItem(event: APIGatewayProxyEvent) {
    const todoId = event.pathParameters.todoId;
    const userId = getUserId(event);

    if (!(await todoAccess.getTodoItem(todoId, userId))) {
        return false;
    }
    console.log('delete todo item by todoId: ' + todoId + " userId: " + userId )
    await todoAccess.deleteTodoItem(todoId, userId);

    return true;
}

export async function generateUploadUrl(event: APIGatewayProxyEvent): Promise<string> {
    const bucket = await todosStorage.getBucketName();
    const urlExpiration = process.env.SIGNED_URL_EXPIRATION;
    const todoId = event.pathParameters.todoId;
    console.log('generateUploadUrl bucket: ' + bucket + " todoId: "+todoId )
    return await todosStorage.getPresignedUploadURL(bucket,todoId,urlExpiration);
}