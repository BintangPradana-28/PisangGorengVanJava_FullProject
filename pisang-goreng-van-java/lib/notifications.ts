/**
 * lib/notifications.ts
 * 
 * Abstraksi untuk mengirim notifikasi ke pelanggan via WhatsApp.
 * Karena ini adalah bisnis yang baru merintis dari 0, merekomendasikan provider berbayar 
 * berisiko (biaya bulanan). Untuk MVP, kita membuat abstraksi webhook ini agar siap 
 * disambungkan ke API gratis/freemium (seperti Fonnte versi free atau Watzap) di masa depan.
 */

export async function sendWhatsAppNotification(
  customerPhone: string,
  customerName: string,
  orderStatus: string,
  orderId: string
) {
  try {
    let message = ''

    if (orderStatus === 'confirmed') {
      message = `Halo Kak ${customerName}! 🍌\nPesanan Pisang Goreng Van Java Anda (ID: ${orderId.slice(-5).toUpperCase()}) telah Dikonfirmasi dan sedang diproses di dapur kami.`
    } else if (orderStatus === 'ready') {
      message = `Yeay! 🥳\nPesanan Pisang Goreng Van Java Anda (ID: ${orderId.slice(-5).toUpperCase()}) sudah SIAP! Silakan diambil atau ditunggu kedatangan kurirnya ya Kak.`
    } else if (orderStatus === 'cancelled') {
      message = `Mohon maaf Kak ${customerName} 🙏\nPesanan Anda (ID: ${orderId.slice(-5).toUpperCase()}) terpaksa kami batalkan. Hubungi admin untuk informasi lebih lanjut.`
    } else {
      return // Tidak ada notifikasi untuk status lain
    }

    console.log(`\n==========================================`)
    console.log(`[MOCK WEBHOOK WA] Mempersiapkan pengiriman:`)
    console.log(`Ke     : ${customerPhone}`)
    console.log(`Pesan  :\n${message}`)
    console.log(`==========================================\n`)

    // TODO: Ganti block mock di atas dengan fetch API beneran ke Fonnte/Watzap.
    /*
    const fonnteToken = process.env.FONNTE_TOKEN
    if (fonnteToken) {
      await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: { 'Authorization': fonnteToken },
        body: new URLSearchParams({
          target: customerPhone,
          message: message,
        })
      })
    }
    */
    
    return { success: true }
  } catch (error) {
    console.error('[WEBHOOK ERROR] Gagal mengirim notifikasi WA:', error)
    return { success: false, error }
  }
}
