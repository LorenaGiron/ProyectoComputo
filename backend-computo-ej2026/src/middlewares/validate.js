export function validate(schema, target = 'body') {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req[target])

      if (!result.success) {
        const errors = {}

        for (const issue of result.error.issues) {
          const key = issue.path.join('.') || 'root'
          errors[key] = issue.message
        }

        return res.status(400).json({
          message: 'Error de validación',
          errors
        })
      }
      if (target === 'body') {
        req.body = result.data
      } else {
        Object.assign(req[target], result.data)
      }
      if (target === 'query') {
        Object.assign(req.query, result.data)
      } else {
        req[target] = result.data
      }
      next()
    } catch (error) {
      next(error)
    }
  }
}