export default function BenefitsSection() {
  const benefits = [
    {
      icon: '🚚',
      title: 'Miễn phí vận chuyển',
      desc: 'Miễn phí giao hàng cho đơn từ 500.000đ trên toàn quốc',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: '↩️',
      title: 'Đổi trả dễ dàng',
      desc: 'Đổi trả miễn phí trong vòng 30 ngày nếu không hài lòng',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: '🎓',
      title: 'Giảm 10% cho sinh viên',
      desc: 'Ưu đãi đặc biệt dành cho các bạn sinh viên',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: '🎁',
      title: 'Voucher quà tặng',
      desc: 'Tặng ngay voucher khi mua sản phẩm đầu tiên',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
            ✨ Tại sao chọn chúng tôi
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Cam kết dịch vụ
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Chúng tôi luôn đặt khách hàng lên hàng đầu với những dịch vụ tốt nhất
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group relative bg-gray-50 rounded-2xl p-6 hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${benefit.color} flex items-center justify-center text-2xl text-white shadow-lg mb-5 group-hover:scale-110 transition-transform`}>
                {benefit.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {benefit.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {benefit.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
