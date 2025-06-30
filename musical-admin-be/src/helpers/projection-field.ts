/* eslint-disable no-prototype-builtins */
import { parseResolveInfo } from 'graphql-parse-resolve-info'

class ProjecttionField {
	public async ParseProjectionField(resolverInfo, modelSchema) {
		
		const parsedInfo = parseResolveInfo(resolverInfo)
		
		const returnType = Object.keys(parsedInfo.fieldsByTypeName).filter(
			(field) => field !== '_Entity'
		)[0]
			
		const baseType = returnType.replace('Connection', '')
		const modelSchemaFields: string[] | [] = Object.keys(modelSchema)

		let queryFields: string[]
		
		if (parsedInfo.fieldsByTypeName[returnType].hasOwnProperty('edges')) {
			
			const nodeFields =
				parsedInfo.fieldsByTypeName[returnType]['edges'].fieldsByTypeName[`${baseType}Edge`].node
					.fieldsByTypeName[baseType] 					
			queryFields = Object.keys(nodeFields)			

		} else {
			
			
			queryFields = Object.keys(parsedInfo.fieldsByTypeName[returnType])
		}

		modelSchemaFields.forEach((field) => {
			const regex = /Id$/
			if (!regex.test(field)) return
			const modelName = field.slice(0, -2)
			const fieldIndex = queryFields.indexOf(modelName)
			if (fieldIndex === -1) return
			queryFields[fieldIndex] = field
		})

		const trimmedQueryFields = queryFields.filter((field) => modelSchemaFields.includes(field))
		trimmedQueryFields.push('_id', 'createdAt','updatedAt')

		return trimmedQueryFields.join(' ')
	}
}

export default new ProjecttionField()
