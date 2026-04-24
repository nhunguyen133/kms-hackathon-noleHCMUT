const cron = require('node-cron');
const earlyWarningService = require('./early-warning.service');
const logger = require('../../utils/logger');

// Hệ thống tự động đánh giá sau mỗi 24 giờ
const startEarlyWarningCron = () => {
    cron.schedule('0 2 * * *', async () => {
        logger.info('Starting Early Warning System scan cron job...');
        
        try {
            await Promise.all([
                earlyWarningService.scanInactivity(),
                earlyWarningService.scanStagnantProgress()
            ]);
            
            logger.info('Early Warning scan cron job completed.');
        } catch (error) {
            logger.error('Error while running Early Warning cron job', { stack: error.stack });
        }
    });

    logger.info('Early Warning cron job initialized (Schedule: 02:00 AM daily).');
};

module.exports = { startEarlyWarningCron };