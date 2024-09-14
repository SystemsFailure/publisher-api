import express from 'express';
import getAllFileByAdId from '../controllers/files/get.all.files.by.id';
import { authMiddleware } from '../middleware/auth.middleware';
import { getNewExcelController } from '../controllers/get.new.excel';
import { getSavedTableByIdController } from '../controllers/get.one.saved.table';
import { getManagerController } from '../controllers/get.manager.controller';
import { getAvitoAutoloads } from '../controllers/get.avito.autoloads';
import { getCredentialsController } from '../controllers/credentials/get.credentials';
import { signupController } from '../controllers/post.signup.controller';
import { loginController } from '../controllers/post.login.controller';
import { uploadJsonController } from '../controllers/upload.json.controller';
import { uploadAdsFilesController } from '../controllers/upload.ads.files.controller';
import { createExcelFileController } from '../controllers/post.excel.file';
import { createSavedController } from '../controllers/post.create.saved.table';
import { getAllSavedTablesController } from '../controllers/get.saved.tables';
import { getAllAdsFilesController } from '../controllers/files/get.all.ads.files.from.db';
import { setupAutoloadTimeController } from '../controllers/autoload/avito/post.setup.autoload.time';
import { createAdController } from '../controllers/ad/post.create.ad';
import { getTableByStatus } from '../controllers/tables/get.saved.table.by.status';
import { updateStatusTable } from '../controllers/tables/post.update.status.table';
import { uploadAutoloadAvitoController } from '../controllers/autoload/avito/post.avito.autoload';
import { uploadAutoloadCianController } from '../controllers/autoload/post.cian.upload';
import { uploadAutoloadYoula } from '../controllers/autoload/youla/post.youla.upload';
import { setupPlatformKeysController } from '../controllers/credentials/post.setup.platform.keys';
import { patchTableController } from '../controllers/update.saved.table';
import { updateStatusController } from '../controllers/update.status.controller';
import { updateAdFieldController } from '../controllers/ad/put.update.ad.field';
import { updateAdDataController } from '../controllers/ad/put.update.ad.data';
import { updateTableField } from '../controllers/tables/put.update.table.field';
import { deleteFileController } from '../controllers/files/delete.file';
import { deleteAutoloadYoula } from '../controllers/autoload/youla/delete.youla.autoload';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { uploadAdsFiles } from '../helpers/multer.ads.files.config';
import { getYoulaStatusAutoloadController } from '../controllers/autoload/youla/get.youla.status.autoload';
import { deleteYoulaPublicationAutoloadController } from '../controllers/autoload/youla/delete.youla.publication.autoload';
import { getAllOfficesController } from '../controllers/office/get.all.offices';
import { createOfficeController } from '../controllers/office/create.office';
import { getAllRegionsController } from '../controllers/region/get.all.regions';
import { getOfficesByManagerController } from '../controllers/office/get.offices.by.manager';
import { getAllManagersByOffice } from '../controllers/manager/get.all.managers.by.office';

const router = express.Router();

const routes = {
    get: [
        { path: '/get-new-excel', controller: getNewExcelController },
        { path: '/get-saved-table/:id', controller: getSavedTableByIdController },
        { path: '/get-manager/:id', controller: getManagerController },
        { path: '/get-autoloads/:platform/:managerId', controller: getAvitoAutoloads },
        { path: '/get-office-credentials/:officeId', controller: getCredentialsController },
        { path: '/get-status-autoload-youla/:officeId/:id/:subId', controller: getYoulaStatusAutoloadController },
        { path: '/get-all-offices', controller: getAllOfficesController },
        { path: '/get-all-regions', controller: getAllRegionsController },
        { path: '/get-all-offices-by-manager/:managerId', controller: getOfficesByManagerController },
        { path: '/get-all-managers-by-office/:officeId', controller: getAllManagersByOffice },
    ],
    post: [
        { path: '/signup', controller: signupController },
        { path: '/login', controller: loginController },
        { path: '/upload-json/:managerId', controller: uploadJsonController },
        { path: '/upload-excel/:managerId', middleware: uploadMiddleware, controller: createExcelFileController },
        { path: '/save-table', controller: createSavedController },
        { path: '/upload-start-avito/:id/:officeId', controller: uploadAutoloadAvitoController },
        { path: '/upload-start-cian/:id/:officeId', controller: uploadAutoloadCianController },
        { path: '/upload-ads-files', middleware: uploadAdsFiles.array('files'), controller: uploadAdsFilesController },
        { path: '/get-saved-tables', controller: getAllSavedTablesController },
        { path: '/get-all-ads-files', controller: getAllAdsFilesController },
        { path: '/setup-autoload-time', controller: setupAutoloadTimeController },
        { path: '/get-all-ads-files-by-id', controller: getAllFileByAdId },
        { path: '/create-ad', controller: createAdController },
        { path: '/get-table-by-status', controller: getTableByStatus },
        { path: '/update-table-status/:id', controller: updateStatusTable },
        { path: '/upload-start-youla/:id/:officeId', controller: uploadAutoloadYoula },
        { path: '/setup-platform-keys/:platform/:officeId', controller: setupPlatformKeysController },
        { path: '/create-office', controller: createOfficeController },
    ],
    put: [
        { path: '/update-status-saved-table/:id', controller: patchTableController },
        { path: '/update-status/:id', controller: updateStatusController },
        { path: '/update-ad-field', controller: updateAdFieldController },
        { path: '/update-ad-data', controller: updateAdDataController },
        { path: '/update-table-field', controller: updateTableField }
    ],
    delete: [
        { path: '/delete-ad-file/:id', controller: deleteFileController },
        { path: '/delete-autoload-youla/:id/:officeId/:subId', controller: deleteAutoloadYoula },
        { path: '/delete-publication-autoload-youla/:officeId/:subId', controller: deleteYoulaPublicationAutoloadController }
    ]
};

routes.get.forEach(({ path, controller }) => {
    // if (middleware) {
    //     router.get(path, middleware, controller);
    // } else {
        router.get(path, controller);
    // }
});

routes.post.forEach(({ path, middleware, controller }) => {
    if (Array.isArray(middleware)) {
        router.post(path, ...middleware, controller);
    } else if (middleware) {
        router.post(path, middleware, controller);
    } else {
        router.post(path, controller);
    }
});

routes.put.forEach(({ path, controller }) => {
    router.put(path, controller);
});

routes.delete.forEach(({ path, controller }) => {
    router.delete(path, controller);
});

export default router;