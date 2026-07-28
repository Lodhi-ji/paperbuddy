import prisma from '../db.js';

// GET /api/messages/contacts
export async function getContacts(req, res) {
  const userId = req.user.id;
  const schoolId = req.schoolId;
  const role = req.user.role;

  try {
    let contacts = [];

    if (role === 'STUDENT') {
      // Students can message SCHOOL_ADMIN and ACCOUNTANT
      contacts = await prisma.user.findMany({
        where: {
          schoolId,
          role: { in: ['SCHOOL_ADMIN', 'ACCOUNTANT'] },
          status: 'active'
        },
        select: {
          id: true,
          name: true,
          role: true,
          email: true,
        },
      });
    } else {
      // Staff can message anyone in the school (except themselves)
      contacts = await prisma.user.findMany({
        where: {
          schoolId,
          id: { not: userId },
          status: 'active'
        },
        select: {
          id: true,
          name: true,
          role: true,
          email: true,
          studentProfile: {
            select: { class: true, section: true, rollNumber: true }
          }
        },
      });
    }

    // Now get the latest message for each contact to show snippet and unread count
    const enrichedContacts = await Promise.all(contacts.map(async (contact) => {
      const lastMessage = await prisma.message.findFirst({
        where: {
          OR: [
            { senderId: userId, receiverId: contact.id },
            { senderId: contact.id, receiverId: userId },
          ]
        },
        orderBy: { createdAt: 'desc' },
      });

      const unreadCount = await prisma.message.count({
        where: {
          senderId: contact.id,
          receiverId: userId,
          isRead: false
        }
      });

      return {
        ...contact,
        lastMessage: lastMessage ? lastMessage.content : null,
        lastMessageAt: lastMessage ? lastMessage.createdAt : null,
        unreadCount
      };
    }));

    // Sort by most recent message
    enrichedContacts.sort((a, b) => {
      if (!a.lastMessageAt && !b.lastMessageAt) return 0;
      if (!a.lastMessageAt) return 1;
      if (!b.lastMessageAt) return -1;
      return new Date(b.lastMessageAt) - new Date(a.lastMessageAt);
    });

    return res.json(enrichedContacts);
  } catch (error) {
    console.error('Get contacts error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/messages/:targetUserId
export async function getMessages(req, res) {
  const userId = req.user.id;
  const { targetUserId } = req.params;

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: userId },
        ]
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark as read
    await prisma.message.updateMany({
      where: {
        senderId: targetUserId,
        receiverId: userId,
        isRead: false
      },
      data: { isRead: true }
    });

    return res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/messages/:targetUserId
export async function sendMessage(req, res) {
  const userId = req.user.id;
  const schoolId = req.schoolId;
  const { targetUserId } = req.params;
  const { content } = req.body;

  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'Message content cannot be empty' });
  }

  try {
    const targetUser = await prisma.user.findFirst({
      where: { id: targetUserId, schoolId }
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'Target user not found in your school' });
    }

    const message = await prisma.message.create({
      data: {
        schoolId,
        senderId: userId,
        receiverId: targetUserId,
        content: content.trim()
      }
    });

    return res.json(message);
  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
