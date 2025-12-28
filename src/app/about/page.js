'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-20">
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <span className="inline-block px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold mb-6 border border-blue-500/30">
                            📚 Về chúng tôi
                        </span>
                        <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                            BookStore - Thư viện
                            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Cybersecurity</span>
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            Nơi cung cấp những cuốn sách chất lượng nhất về bảo mật thông tin,
                            giúp bạn nâng cao kiến thức và kỹ năng trong lĩnh vực Cybersecurity.
                        </p>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="py-16">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">Sứ mệnh của chúng tôi</h2>
                                <p className="text-gray-600 mb-4 leading-relaxed">
                                    BookStore được thành lập với mục tiêu mang đến cho cộng đồng Việt Nam nguồn tài liệu
                                    chất lượng cao về an ninh mạng và bảo mật thông tin.
                                </p>
                                <p className="text-gray-600 mb-4 leading-relaxed">
                                    Chúng tôi tin rằng kiến thức về Cybersecurity không chỉ dành cho các chuyên gia,
                                    mà cần được phổ biến rộng rãi để mọi người có thể bảo vệ bản thân trong thời đại số.
                                </p>
                                <p className="text-gray-600 leading-relaxed">
                                    Với đội ngũ chuyên gia am hiểu sâu về lĩnh vực, chúng tôi tuyển chọn những đầu sách
                                    hay nhất từ các tác giả và nhà xuất bản uy tín trên thế giới.
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
                                <div className="grid grid-cols-2 gap-6 text-center">
                                    <div className="bg-white/10 rounded-xl p-6">
                                        <div className="text-4xl font-bold mb-2">30</div>
                                        <div className="text-blue-200">Đầu sách</div>
                                    </div>
                                    <div className="bg-white/10 rounded-xl p-6">
                                        <div className="text-4xl font-bold mb-2">6</div>
                                        <div className="text-blue-200">Danh mục</div>
                                    </div>
                                    <div className="bg-white/10 rounded-xl p-6">
                                        <div className="text-4xl font-bold mb-2">99%</div>
                                        <div className="text-blue-200">Khách hàng hài lòng</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="py-16 bg-white">
                    <div className="max-w-6xl mx-auto px-4">
                        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Giá trị cốt lõi</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center p-6">
                                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Chất lượng</h3>
                                <p className="text-gray-600">
                                    Tuyển chọn kỹ lưỡng những đầu sách có giá trị, đảm bảo nội dung chính xác và cập nhật.
                                </p>
                            </div>
                            <div className="text-center p-6">
                                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Đa dạng</h3>
                                <p className="text-gray-600">
                                    Phủ rộng các lĩnh vực từ Cryptography, Forensics đến Reverse Engineering và Pwnable.
                                </p>
                            </div>
                            <div className="text-center p-6">
                                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Cộng đồng</h3>
                                <p className="text-gray-600">
                                    Xây dựng cộng đồng học tập, chia sẻ kiến thức và hỗ trợ lẫn nhau cùng phát triển.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section className="py-16">
                    <div className="max-w-6xl mx-auto px-4">
                        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Đội ngũ phát triển</h2>
                        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                            Dự án được thực hiện bởi nhóm 22 - Lớp Lập trình Web
                        </p>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { name: 'Thành viên 1', role: 'Frontend Developer' },
                                { name: 'Thành viên 2', role: 'Backend Developer' },
                                { name: 'Thành viên 3', role: 'UI/UX Designer' },
                            ].map((member, idx) => (
                                <div key={idx} className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                                    <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                                        <span className="text-3xl font-bold text-white">{member.name.charAt(0)}</span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                                    <p className="text-gray-500">{member.role}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
