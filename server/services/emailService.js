const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

const generateInvoicePDF = async (bookingData) => {
    const doc = new PDFDocument({ margin: 50 });
    
    const qrData = JSON.stringify({
      id: bookingData._id,
      type: "ELITE_TICKET"
    });

    const qrCodeImage = await QRCode.toDataURL(qrData);

    return new Promise((resolve) => {
        let buffers = []; 
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // --- PDF Design ---
        doc.fillColor('#CA8A04').fontSize(26).text('ELITE EVENTS', { align: 'center', weight: 'bold' });
        doc.fillColor('black').fontSize(12).text('AHMEDABAD\'S PREMIUM EVENT ECOSYSTEM', { align: 'center' });
        doc.moveDown();
        doc.fontSize(18).text('OFFICIAL ENTRY PASS', { align: 'center', underline: true });
        doc.moveDown(2);
        
        doc.fontSize(14).text(`Event: ${bookingData.eventName}`, { weight: 'bold' });
        doc.text(`Booking ID: ${bookingData._id}`);
        doc.text(`Attendee: ${bookingData.userName}`);
        
        // 🎯 NEW: Log the exact Tier Type directly onto the PDF
        doc.text(`Ticket Type: ${bookingData.ticketTierName || 'General Admission'}`);
        doc.text(`Tickets (PAX): ${bookingData.pax || bookingData.ticketsBooked}`);
        
        doc.fillColor('#CA8A04').text(`Amount Paid: ₹${bookingData.totalAmount}`, { weight: 'bold' });
        
        doc.moveDown(2);
        doc.fillColor('black').fontSize(10).text('Scan this code at the entry gate:', { align: 'center' });
        doc.image(qrCodeImage, { 
            fit: [180, 180], 
            align: 'center',
            valign: 'center'
        });
        
        doc.moveDown(10);
        doc.fontSize(8).text('This is a computer-generated invoice. No signature required.', { align: 'center', color: 'grey' });
        
        doc.end();
    });
};

const sendBookingEmail = async (userEmail, bookingData) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { 
          user: process.env.EMAIL_USER, 
          pass: process.env.EMAIL_PASS 
        },
    });

    const pdfBuffer = await generateInvoicePDF(bookingData);
    const tierName = bookingData.ticketTierName || 'General Admission';

    const mailOptions = {
        from: `"EliteEvents" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: `🎟️ Ticket Confirmed: ${bookingData.eventName}`,
        html: `<h3>Hi ${bookingData.userName},</h3>
               <p>Your booking for <b>${bookingData.eventName}</b> is confirmed!</p>
               <p>You have secured a <b>${tierName}</b> pass.</p>
               <p>Please find your official entry pass attached as a PDF.</p>`,
        attachments: [{ filename: `EliteTicket_${bookingData._id}.pdf`, content: pdfBuffer }],
    };

    return transporter.sendMail(mailOptions);
};

module.exports = { sendBookingEmail, generateInvoicePDF };


// const sendBookingEmail = async (userEmail, bookingData) => {
//     // 1. Create a Transporter (Use your Gmail with an App Password)
//     const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: process.env.EMAIL_USER, 
//             pass: process.env.EMAIL_PASS, // Use App Password, not your real password
//         },
//     });

//     // 2. Generate QR Code as a Data URL
//     const qrData = `PASS_ID:${bookingData._id}|PAX:${bookingData.pax}|HOLDER:${bookingData.userName}`;
//     const qrCodeImage = await QRCode.toDataURL(qrData);

//     // 3. Create PDF in memory
//     const doc = new PDFDocument();
//     let buffers = [];
//     doc.on('data', buffers.push.bind(buffers));
    
//     return new Promise((resolve, reject) => {
//         doc.on('end', async () => {
//             const pdfData = Buffer.concat(buffers);

//             // 4. Send the Email
//             const mailOptions = {
//                 from: '"EliteEvents" <your-email@gmail.com>',
//                 to: userEmail,
//                 subject: 'Booking Confirmed! Your EliteEvents Pass',
//                 text: `Hi ${bookingData.userName}, your booking for ${bookingData.eventName} is confirmed!`,
//                 attachments: [
//                     {
//                         filename: `Invoice_${bookingData._id}.pdf`,
//                         content: pdfData,
//                     },
//                 ],
//             };

//             try {
//                 await transporter.sendMail(mailOptions);
//                 resolve(true);
//             } catch (error) {
//                 reject(error);
//             }
//         });

//         // --- PDF Content Layout ---
//         doc.fontSize(25).text('EliteEvents Invoice', { align: 'center' });
//         doc.moveDown();
//         doc.fontSize(14).text(`Booking ID: ${bookingData._id}`);
//         doc.text(`Event: ${bookingData.eventName}`);
//         doc.text(`Name: ${bookingData.userName}`);
//         doc.text(`Seats/PAX: ${bookingData.pax}`);
//         doc.text(`Total Paid: ₹${bookingData.totalAmount}`);
//         doc.moveDown();
//         doc.image(qrCodeImage, { fit: [150, 150], align: 'center' });
//         doc.text('Scan this at the venue entry.', { align: 'center' });
//         doc.end();
//     });
// };

// // MAKE SURE THIS IS AT THE VERY BOTTOM
// module.exports = { 
//     sendBookingEmail 
// };