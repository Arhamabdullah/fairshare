const admin = require('firebase-admin');
const functions = require('firebase-functions');

admin.initializeApp();

async function sendToAll(title, body) {
  const snapshot = await admin.firestore().collection('roommates').get();
  const tokens = snapshot.docs.map((doc) => doc.data().pushToken).filter(Boolean);
  if (!tokens.length) return null;
  return admin.messaging().sendEachForMulticast({
    tokens,
    notification: { title, body },
  });
}

exports.onExpenseCreated = functions.firestore
  .document('expenses/{expenseId}')
  .onCreate(async (snap) => {
    const expense = snap.data();
    const amount = Number(expense.amount || 0).toFixed(2);
    return sendToAll('New grocery expense added', `A new grocery expense of £${amount} was added.`);
  });

exports.sendTomorrowDutyReminders = functions.pubsub
  .schedule('0 20 * * *')
  .timeZone('Europe/London')
  .onRun(async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateKey = tomorrow.toISOString().slice(0, 10);
    const weekday = tomorrow.toLocaleDateString('en-GB', {
      weekday: 'long',
      timeZone: 'Europe/London',
    });

    const cookingSnapshot = await admin
      .firestore()
      .collection('cookingAssignments')
      .where('date', '==', dateKey)
      .get();

    for (const doc of cookingSnapshot.docs) {
      const assignment = doc.data();
      const roommateDoc = await admin
        .firestore()
        .collection('roommates')
        .doc(assignment.roommateId)
        .get();
      const token = roommateDoc.data()?.pushToken;
      if (token) {
        await admin.messaging().send({
          token,
          notification: { title: 'Cooking reminder', body: 'Tomorrow is your cooking day.' },
        });
      }
    }

    const cleaningSnapshot = await admin
      .firestore()
      .collection('cleaningGroups')
      .where('day', '==', weekday)
      .get();

    for (const groupDoc of cleaningSnapshot.docs) {
      const group = groupDoc.data();
      for (const roommateId of group.memberIds || []) {
        const roommateDoc = await admin.firestore().collection('roommates').doc(roommateId).get();
        const token = roommateDoc.data()?.pushToken;
        if (token) {
          await admin.messaging().send({
            token,
            notification: { title: 'Cleaning reminder', body: 'Tomorrow is your cleaning duty.' },
          });
        }
      }
    }

    return null;
  });

exports.sendSettlementReminders = functions.pubsub
  .schedule('0 10 * * 1')
  .timeZone('Europe/London')
  .onRun(async () => {
    const snapshot = await admin.firestore().collection('settlements').get();
    for (const doc of snapshot.docs) {
      const row = doc.data();
      if ((row.remaining || 0) <= 0) continue;
      const roommateDoc = await admin.firestore().collection('roommates').doc(row.roommateId).get();
      const token = roommateDoc.data()?.pushToken;
      if (token) {
        await admin.messaging().send({
          token,
          notification: {
            title: 'Settlement reminder',
            body: `You still owe £${Number(row.remaining || 0).toFixed(2)} this month.`,
          },
        });
      }
    }
    return null;
  });
