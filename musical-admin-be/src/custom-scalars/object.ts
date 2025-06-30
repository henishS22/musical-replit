import { GraphQLScalarType, Kind } from 'graphql'

export const Anything = new GraphQLScalarType({
	name: 'Anything',
	description: 'Any value.',
	parseValue: (value) => {
		return typeof value === 'object' ? value : typeof value === 'string' ? JSON.parse(value) : null
	},
	serialize: (value) => {
		return typeof value === 'object' ? value : typeof value === 'string' ? JSON.parse(value) : null
	},
	parseLiteral: (ast) => {
		switch (ast.kind) {
			case Kind.STRING:
				return JSON.parse(ast.value)
			case Kind.OBJECT:
				throw new Error('Not sure what to do with OBJECT for ObjectScalarType')
			default:
				return null
		}
	},
})
