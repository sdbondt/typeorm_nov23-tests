import { EntityTarget, Repository } from "typeorm"
import { AppDataSource, TestDataSource } from "../data-source"

// HandleGetRepository: handler for returning the correct repository depending on the node environment.
const handleGetRepository = <T>(entity: EntityTarget<T>): Repository<T> => {
    const environment = process.env.NODE_ENV || 'development'
    return environment === 'test' ? TestDataSource.manager.getRepository(entity): AppDataSource.manager.getRepository(entity)
}

export default handleGetRepository