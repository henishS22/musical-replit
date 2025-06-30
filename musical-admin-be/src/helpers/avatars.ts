import { Logger } from '@core/logger'
import { GenerateRandomStringOfLength } from '@core/utils'

class AvatarHelper {
    public getAvatar() {
        Logger.info('Inside Avatar Helper')
        const randomSeed = GenerateRandomStringOfLength(10)
        return `https://api.dicebear.com/9.x/identicon/svg?seed=${randomSeed}&randomizeIds=false`
    }
}

export default new AvatarHelper()
