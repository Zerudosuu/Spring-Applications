package com.taskmanager.taskmanager.feature.comment;


import com.taskmanager.taskmanager.feature.ticket.TicketRepository;
import com.taskmanager.taskmanager.feature.user.UserRepository;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private UserRepository userRepository;



}
