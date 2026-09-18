const { io } = require('C:/Users/zoom store/Desktop/youtube/Watch_Party_System/frontend/node_modules/socket.io-client');

const host = io('http://localhost:5000');
const viewer = io('http://localhost:5000');

host.on('connect', () => {
  host.emit('create_room', { username: 'HostA' }, (res) => {
    const code = res.room.roomCode;
    console.log('1. room created: ' + code + ' count=' + res.room.participants.length);

    viewer.emit('join_room', { roomCode: code, username: 'ViewerB' }, (ack) => {
      console.log('2. viewer joined count=' + ack.room.participants.length);

      const leaver = io('http://localhost:5000');
      leaver.emit('join_room', { roomCode: code, username: 'LeaverC' }, (ack2) => {
        const leaverId = ack2.participant.id;
        console.log('3. leaver joined count=' + ack2.room.participants.length);

        host.on('user_left', (d) => {
          console.log('4. USER_LEFT received username=' + d.username + ' count=' + d.participants.length);
        });

        leaver.disconnect();

        setTimeout(() => {
          const s2 = io('http://localhost:5000');
          s2.on('connect', () => {
            s2.emit('join_room', { roomCode: code, username: 'LeaverC', participantId: leaverId }, (ack3) => {
              console.log('5. rejoin after disconnect ok=' + ack3.ok + ' msg=' + (ack3.message || '-'));
              host.close();
              viewer.close();
              s2.close();
              process.exit(0);
            });
          });
        }, 800);
      });
    });
  });
});

setTimeout(() => { console.log('TIMEOUT'); process.exit(1); }, 8000);
