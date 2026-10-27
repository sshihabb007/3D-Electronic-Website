import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { AdminService } from './admin.service';

const uploadDir = join(process.cwd(), 'public', 'uploads', 'models');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const glbStorage = diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    const ext = extname(file.originalname).toLowerCase() || '.glb';
    cb(null, `model-${uniqueSuffix}${ext}`);
  },
});

@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('system-state')
  getSystemState() {
    return this.adminService.getEnterpriseState();
  }

  @Put('system-state')
  updateSystemState(@Body() body: any) {
    return this.adminService.updateEnterpriseState(body);
  }

  @Post('cdn-purge')
  purgeCdnCache() {
    return this.adminService.purgeCdnCache();
  }

  @Get('reviews')
  getAllReviews() {
    return this.adminService.getAllReviews();
  }

  @Patch('reviews/:id')
  toggleReviewVerified(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { isVerifiedPurchase: boolean },
  ) {
    return this.adminService.toggleReviewVerified(id, body.isVerifiedPurchase);
  }

  @Delete('reviews/:id')
  deleteReview(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteReview(id);
  }

  @Post('batch-catalog')
  batchUpdateCatalog(@Body() body: any) {
    return this.adminService.batchUpdateCatalog(body);
  }

  @Get('products')
  getAllProductsForAdmin() {
    return this.adminService.getAllProductsForAdmin();
  }

  @Get('orders')
  getOrders() {
    return this.adminService.getAllOrders();
  }

  @Get('orders/:id')
  getOrderById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getOrderById(id);
  }

  @Post('orders')
  createAdminOrder(@Body() body: any) {
    return this.adminService.createAdminOrder(body);
  }

  @Put('orders/:id')
  updateOrder(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.adminService.updateOrder(id, body);
  }

  @Put('orders/:id/status')
  updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.adminService.updateOrderStatus(id, body);
  }

  @Post('orders/bulk-status')
  bulkUpdateOrderStatus(@Body() body: any) {
    return this.adminService.bulkUpdateOrderStatus(body);
  }

  @Delete('orders/:id')
  deleteOrder(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteOrder(id);
  }

  @Post('products')
  createProduct(@Body() body: any) {
    return this.adminService.createOrUpdateProduct(body);
  }

  @Put('products/:id')
  updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.adminService.createOrUpdateProduct(body, id);
  }

  @Post('products/:id/duplicate')
  duplicateProduct(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.duplicateProduct(id);
  }

  @Put('products/:id/config3d')
  updateProduct3DConfig(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.adminService.updateProduct3DConfig(id, body);
  }

  @Patch('products/:id/quick')
  quickPatchProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.adminService.quickPatchProduct(id, body);
  }

  @Delete('products/:id')
  deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteProduct(id);
  }

  @Post('upload-glb')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: glbStorage,
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  uploadGlbStandalone(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(
        'Please select a .glb, .gltf, or .usdz file to upload',
      );
    }
    return {
      glbFileUrl: `/uploads/models/${file.filename}`,
      originalName: file.originalname,
      size: file.size,
    };
  }

  @Post('products/:id/upload-glb')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: glbStorage,
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async uploadGlbForProduct(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Please select a .glb, .gltf, or .usdz 3D file');
    }
    const url = `/uploads/models/${file.filename}`;
    return this.adminService.attachGlbToProduct(id, url);
  }

  @Post('products/:id/variants')
  addVariant(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.adminService.addVariant(id, body);
  }

  @Put('variants/:variantId')
  updateVariant(
    @Param('variantId', ParseIntPipe) variantId: number,
    @Body() body: any,
  ) {
    return this.adminService.updateVariant(variantId, body);
  }

  @Delete('variants/:variantId')
  deleteVariant(@Param('variantId', ParseIntPipe) variantId: number) {
    return this.adminService.deleteVariant(variantId);
  }

  @Post('products/:id/hotspots')
  addHotspot(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.adminService.addHotspot(id, body);
  }

  @Put('hotspots/:hotspotId')
  updateHotspot(
    @Param('hotspotId', ParseIntPipe) hotspotId: number,
    @Body() body: any,
  ) {
    return this.adminService.updateHotspot(hotspotId, body);
  }

  @Delete('hotspots/:hotspotId')
  deleteHotspot(@Param('hotspotId', ParseIntPipe) hotspotId: number) {
    return this.adminService.deleteHotspot(hotspotId);
  }

  @Post('categories')
  createCategory(@Body() body: any) {
    return this.adminService.createCategory(body);
  }

  @Put('categories/:id')
  updateCategory(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.adminService.updateCategory(id, body);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteCategory(id);
  }

  @Put('users/:id/role')
  updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { role: 'ADMIN' | 'CUSTOMER' },
  ) {
    return this.adminService.updateUserRole(id, body.role);
  }

  @Delete('users/:id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteUser(id);
  }
}
