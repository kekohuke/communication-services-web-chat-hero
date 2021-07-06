import { connect } from 'react-redux';

import { ChatParticipant } from '@azure/communication-chat';
import { Constants } from '../core/constants';
import ChatHeader from '../components/ChatHeader';
import { State } from '../core/reducers/index';
import { removeThreadMemberByUserId } from '../core/sideEffects';
import { utils } from '../utils/utils';

export type ChatHeaderProps = {
  userId: string;
  existsTopicName: boolean;
  topic: string;
  threadMembers: ChatParticipant[];
  generateHeaderMessage: () => string;
};

export type ChatHeaderDispatchProps = {
  removeChatParticipantById: (userId: string) => Promise<void>;
};

const mapStateToProps = (state: State): ChatHeaderProps => ({
  userId: state.contosoClient.user.identity,
  existsTopicName: state.thread.topic !== Constants.GUID_FOR_INITIAL_TOPIC_NAME,
  topic: state.thread.topic,
  threadMembers: state.threadMembers.threadMembers,
  generateHeaderMessage: () => {
    let header = 'Chat with ';

    if (state.threadMembers === undefined) {
      header += 'yourself';
      return header;
    }

    let members = state.threadMembers.threadMembers.filter(
      (member: ChatParticipant) => !utils.isUserMatchingIdentity(member.id, state.contosoClient.user.identity)
    );
    if (members.length === 0) {
      header += 'yourself';
      return header;
    }

    // if we have at least one other participant we want to show names for the first 3
    if (members.length > 0) {
      let namedMembers = members.slice(0, 3);
      header += namedMembers.map((member: ChatParticipant) => member.displayName).join(', ');
    }

    // if we have more than 3 other participants we want to show the number of other participants
    if (members.length > 3) {
      let len = members.length - 3;
      header += ` and ${len} other participant${len === 1 ? '' : 's'}`;
    }

    return header;
  }
});

const mapDispatchToProps = (dispatch: any): ChatHeaderDispatchProps => ({
  removeChatParticipantById: (userId: string) => dispatch(removeThreadMemberByUserId(userId))
});

export default connect(mapStateToProps, mapDispatchToProps)(ChatHeader);
