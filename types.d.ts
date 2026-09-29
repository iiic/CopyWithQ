// Type declarations for methods added to built-in prototypes by modules/*.mjs

interface String
{
	/** Added by modules/string/splitIntoWords.mjs */
	splitIntoWords ( chars?: string ): string[];
}

interface ObjectConstructor
{
	/** Added by modules/object/deepAssign.mjs */
	deepAssign<T = Record<string, any>> ( ...sources: Array<Record<string, any>> ): T;
}
