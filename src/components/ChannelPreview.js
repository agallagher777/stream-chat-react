import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ChannelPreview = ({
  Preview,
  setActiveChannel,
  watchers,
  channel,
  activeChannel,
  closeMenu,
}) => {
  const [unread, setUnread] = useState(0);
  const [lastRead, setLastRead] = useState(new Date());
  const [lastMessage, setLastMessage] = useState({});

  useEffect(() => {
    const handleEvent = (event) => {
      setLastMessage(event.message);
      if (!isActive()) {
        const unread = channel.countUnread(lastRead);
        setUnread(unread);
      } else {
        setUnread(0);
      }
    };

    const unread = channel.countUnread(lastRead);
    setUnread(unread);

    channel.on('message.new', handleEvent);

    return () => {
      channel.off('message.new', handleEvent);
    };
  }, [channel]);

  useEffect(() => {
    // listen to change...
    if (isActive()) {
      setLastRead(new Date());
      setUnread(0);
    }
  }, [channel, activeChannel, isActive]);

  const isActive = () => activeChannel.cid === channel.cid;

  return (
    <Preview
      lastMessage={lastMessage}
      channel={channel}
      unread={unread}
      latestMessage={getPreviewLatestMessage(channel)}
      activeChannel={activeChannel}
      active={activeChannel.cid === channel.cid}
      setActiveChannel={setActiveChannel}
      watchers={watchers}
      closeMenu={closeMenu}
    />
  );
};

export const getPreviewLatestMessage = (channel) => {
  const latestMessage =
    channel.state.messages[channel.state.messages.length - 1];

  if (!latestMessage) {
    return 'Nothing yet...';
  }
  if (latestMessage.deleted_at) {
    return 'Message deleted';
  }
  if (latestMessage.text) {
    return latestMessage.text;
  } else {
    if (latestMessage.command) {
      return '/' + latestMessage.command;
    }
    if (latestMessage.attachments.length) {
      return '🏙 Attachment...';
    }
    return 'Empty message...';
  }
};

ChannelPreview.propTypes = {
  /** **Available from [chat context](https://getstream.github.io/stream-chat-react/#chat)** */
  channel: PropTypes.object.isRequired,
  /** Current selected channel object */
  activeChannel: PropTypes.object.isRequired,
  /** Setter for selected channel */
  setActiveChannel: PropTypes.func.isRequired,
  /**
   * Available built-in options (also accepts the same props as):
   *
   * 1. [ChannelPreviewCompact](https://getstream.github.io/stream-chat-react/#ChannelPreviewCompact) (default)
   * 2. [ChannelPreviewLastMessage](https://getstream.github.io/stream-chat-react/#ChannelPreviewLastMessage)
   * 3. [ChannelPreviewMessanger](https://getstream.github.io/stream-chat-react/#ChannelPreviewMessanger)
   *
   * The Preview to use, defaults to ChannelPreviewLastMessage
   * */
  Preview: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  /**
   * Object containing watcher parameters
   * @see See [Pagination documentation](https://getstream.io/chat/docs/#channel_pagination) for a list of available fields for sort.
   * */
  watchers: PropTypes.object,
};

export default React.memo(ChannelPreview);
