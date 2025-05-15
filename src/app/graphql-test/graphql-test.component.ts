/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Apollo, gql } from 'apollo-angular';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-graphql-test',
  templateUrl: './graphql-test.component.html',
  styleUrl: './graphql-test.component.scss',
  imports: [CommonModule, FormsModule],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphqlTestComponent implements OnInit {
  greeting: string = 'Initial Hello!';
  loading?: boolean;
  currentTime?: string;
  initialDate?: string;
  message: string = '';
  messages: { content: string; id: number }[] = [];
  selectedMessage?: { content: string; id: number };
  subject = new Subject<void>();

  constructor(private apollo: Apollo, private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.apollo
      .query({
        query: gql`
          query {
            hello
            goodBye
            messages {
              content
            }
          }
        `,
      })
      .subscribe((response: any) => {
        this.greeting = response.data.hello;
        this.cdRef.detectChanges();
      });

    this.apollo
      .subscribe({
        query: gql`
          subscription {
            clock
          }
        `,
      })
      .pipe(takeUntil(this.subject))
      .subscribe((response: any) => {
        this.currentTime = response.data.clock;
        this.cdRef.detectChanges();
      });

    this.apollo
      .subscribe({
        query: gql`
          subscription {
            messageStream {
              id
              content
            }
          }
        `,
      })
      .subscribe((response: any) => {
        if (response.data.messageStream) {
          let selectedMessageIndex = this.messages.findIndex(
            (message) => message.id === this.selectedMessage?.id
          );
          this.messages = response.data.messageStream;
          if (
            !this.messages.find(
              (message) => message.id === this.selectedMessage?.id
            )
          ) {
            if (selectedMessageIndex === 0) {
              selectedMessageIndex++;
            }
            this.selectedMessage = this.messages[selectedMessageIndex - 1];
          }
          if (this.messages.length === 0) {
            delete this.selectedMessage;
          }
          this.cdRef.detectChanges();
        }
      });
  }

  goodBye(): void {
    this.apollo
      .query({
        query: gql`
          query {
            goodBye
          }
        `,
      })
      .subscribe((response: any) => {
        this.greeting = response.data.goodBye;
        this.subject.next();
        this.cdRef.detectChanges();
      });
  }

  sendMessage(): void {
    if (this.message !== '') {
      this.apollo
        .mutate({
          mutation: gql`
          mutation {
            sendMessage(content: "${this.message}", name: "${this.message}") {
              id
              content
              name
            }
          }
        `,
        })
        .subscribe();
    }
  }

  updateMessage(): void {
    this.apollo
      .mutate({
        mutation: gql`
          mutation updateMessage($id: ID!, $content: String!) {
            updateMessage(id: $id, content: $content) {
              id
              content
            }
          }
        `,
        variables: {
          id: this.selectedMessage?.id,
          content: this.message,
        },
      })
      .subscribe();
  }

  deleteMessage(): void {
    this.apollo
      .mutate({
        mutation: gql`
          mutation deleteMessage($id: ID!) {
            deleteMessage(id: $id)
          }
        `,
        variables: {
          id: this.selectedMessage?.id,
        },
      })
      .subscribe(() => {});
  }

  toggleSelectedMessage(selectedMessage: {
    content: string;
    id: number;
  }): void {
    if (selectedMessage.id !== this.selectedMessage?.id) {
      this.selectedMessage = selectedMessage;
      this.message = this.selectedMessage.content;
      this.cdRef.detectChanges();
    } else {
      delete this.selectedMessage;
    }
  }
}
