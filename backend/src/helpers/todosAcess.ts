import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

export  class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly indexName = process.env.TODOS_CREATED_AT_INDEX,
        private readonly todosStorage = process.env.ATTACHMENT_S3_BUCKET
    ) {}
    
    // get all todo items of current user
    async getAllTodoItems(userId) {        
        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.indexName,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise();
  
        return result.Items;
    }

    // get todo items
    async getTodoItem(todoId, userId) {
        const result = await this.docClient.get({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            }
        }).promise();  
        return result.Item;
    }

    // add todo item
    async addTodoItem(todoItem:TodoItem) {
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todoItem
        }).promise();
    }

    // update todo item
    async updateTodoItem(todoId, userId, updatedTodo:TodoUpdate) {
        console.log("update todoId:" +todoId+ " " +userId)
        logger.info("update todoId:" +todoId+ " " +userId)
          await this.docClient.update({
              TableName: this.todosTable,
              Key: {
                todoId,
                  userId
              },
              UpdateExpression: 'set #name = :n, #dueDate = :due, #done = :d',
              ExpressionAttributeValues: {
                  ':n': updatedTodo.name,
                  ':due': updatedTodo.dueDate,
                  ':d': updatedTodo.done
              },
              ExpressionAttributeNames: {
                  '#name': 'name',
                  '#dueDate': 'dueDate',
                  '#done': 'done'
              }
          }).promise();
      }

      // delete todo item
      async deleteTodoItem(todoId, userId) {
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            }
        }).promise();
    }

    // update attachment Url
    async updateTodoAttachmentUrl(todoId: string, attachmentUrl: string){
        console.log('updateTodoAttachmentUrl' + todoId +" "+ attachmentUrl)
        logger.info('updateTodoAttachmentUrl' + todoId +" "+ attachmentUrl)
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                "jobId": todoId
            },
            UpdateExpression: "set attachmentUrl = :attachmentUrl",
            ExpressionAttributeValues: {
                ":attachmentUrl": `https://${this.todosStorage}.s3.amazonaws.com/${attachmentUrl}`
            }
        }).promise();
    }    
}