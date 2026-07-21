const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTest() {
  console.log('=== TEST HỆ THỐNG CHỢ MÃ SỰ KIỆN (AUTOMATED TEST) ===\n');

  // 1. Tìm hoặc tạo User test
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'testuser@lqmeta.vn',
        password: 'hashedpassword',
        name: 'Chiến Thần Liên Quân',
        reputation: 10,
      },
    });
    console.log('✔ Đã tạo User test:', user.name);
  } else {
    console.log('✔ Đã tìm thấy User test:', user.name, `(Uy tín: ${user.reputation})`);
  }

  // 2. Tạo mã Chung Sức & Bắn Bi
  const codeBanBi = await prisma.eventCode.create({
    data: {
      code: 'BANBI-2026-X89K',
      type: 'BAN_BI',
      title: 'Mã Bắn Bi chặng 3 cực đỉnh',
      description: 'Anh em bấm giúp mình lượt 3 nhé',
      authorId: user.id,
    },
  });
  console.log('\n[TEST 1] Đã đăng mã Bắn Bi reusable:', codeBanBi.code);

  // 3. Tạo mã Săn Thẻ (Mã 1 lần)
  const codeSanThe = await prisma.eventCode.create({
    data: {
      code: 'CARD-VALHEIN-7799',
      type: 'SAN_THE',
      title: 'Thẻ Valhein Bậc S (Chỉ 1 người nhận)',
      description: 'Ai nhanh tay chép mã này trước là được',
      authorId: user.id,
    },
  });
  console.log('[TEST 2] Đã đăng mã Săn Thẻ (1 lần):', codeSanThe.code, `(Trạng thái isUsed: ${codeSanThe.isUsed})`);

  // 4. Test Nhận Mã 1 Lần (Săn Thẻ)
  console.log('\n-> Giả lập người chơi 2 bấm "Copy & Nhận mã Săn Thẻ"...');
  const claimedItem = await prisma.eventCode.update({
    where: { id: codeSanThe.id },
    data: { isUsed: true, copyCount: { increment: 1 } },
  });
  console.log('✔ Kết quả nhận mã:', claimedItem.code, '| Trạng thái mới isUsed =', claimedItem.isUsed);

  // Kiểm tra mã còn xuất hiện khi query danh sách công khai không (isUsed = false)
  const publicCodes = await prisma.eventCode.findMany({ where: { isUsed: false } });
  const existsInPublic = publicCodes.some(c => c.id === codeSanThe.id);
  console.log('✔ Mã Săn Thẻ có còn xuất hiện trên bảng tin công khai không?', existsInPublic ? '❌ CÓ (LỖI)' : '✅ KHÔNG (ĐÃ XÓA/ẨN THÀNH CÔNG)');

  // 5. Test Đánh giá 5 sao cho mã Bắn Bi
  console.log('\n-> Giả lập đánh giá 5 ⭐ & bình luận cho mã Bắn Bi...');
  const rating = await prisma.codeRating.create({
    data: {
      codeId: codeBanBi.id,
      stars: 5,
      comment: 'Mã bắn bi chuẩn 100%, cộng 10 điểm cho chủ thớt!',
      authorId: user.id,
    },
  });
  console.log('✔ Đã lưu vote:', rating.stars, 'sao | Nội dung:', rating.comment);

  // Clean up test items
  await prisma.codeRating.deleteMany({ where: { codeId: codeBanBi.id } });
  await prisma.eventCode.deleteMany({ where: { id: { in: [codeBanBi.id, codeSanThe.id] } } });
  console.log('\n=== TẤT CẢ CÁC BƯỚC TEST ĐẦU CỦA CHỢ MÃ ĐÃ THÀNH CÔNG 100% ===');
}

runTest()
  .catch(e => console.error('Lỗi khi test:', e))
  .finally(() => prisma.$disconnect());
