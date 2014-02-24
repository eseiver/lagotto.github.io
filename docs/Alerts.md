---
layout: page
title: "Alerts"
---
## Setup

To properly set up alerts and reports, do the following:

* make sure at least one filter is enabled
* setup mail sending in `config/settings.yml`. The default settings (`address`: localhost, `port`: 25) assume a *postfix* server on the same machine as the ALM software.
* setup cron jobs for rake tasks with `bundle exec whenever -w`. Use `bundle exec whenever` to see all cron jobs created by this command.

## Alerts

Almots are created when errors are raised by the application. The only exception are common errors such as *RecordNotFound*. Alerts that have been resolved can be deleted, and this can be done with a single command for all alerts with the same message, class, or source.

The number of error messages received in the last 24 hours is reported in various places in the admin dashboard.

Since ALM 2.9 we not only collect errors messages, but also other unusual activities, and have therefore renamed error messages to alerts. Also since ALM 2.9 alerts are also shown next to the articles they belong to. This makes it easier to resolve errors.

![Article Alert](/docs/alert-article.png)

## Filters

Filters are used to detect unusual actiivty in the data collected from external APIs. These includes errors, suspicious gaming activity, but also highly unusual articles. For performance reasons filters are only applied to recently collected data (24 hours by default). The following filters are currently available:

* **ApiResponseTooSlowError**. Raise an error if successful API responses took longer than the specified time in seconds.
* **ArticleNotUpdatedError**. Raises an error if articles have not been updated within the specified interval in days
* **EventCountDecreasingError**. Raises an error if the event count decreases.
* **EventCountIncreasingTooFastError**. Raises an error if the event count increases faster than the specified value per day.
* **CitationMilestoneAlert**. Creates an alert if an article has been cited the specified number of times.

The last filter detects milestones reached by articles, all other filters listed here detect errors with the application. Some filters can be configured, and all filters can be disabled.

![Filters](/docs/filters.png)

Filters are relatively easy to write, so please create a Github issue if you have an idea for a new filter. A daily report is then sent out to all admin and staff users who have signed up for this report in their account profile. The report only contains summary information.

## Reports

A background task runs every 24 hours to apply the filters to the API responses of the last 24 hours. Filters can also be applied manually by running `bundle exec rake filter:all`. The API responses will be marked as resolved with this command, use `bundle exec rake filter:unresolve` to again mark them as unresolved. Use this command to re-apply filters after changing filter settings.

Reports can be manually sent by using `bundle exec mailer:all`.

## Most common errors

#### [SOURCE] has exceeded maximum failed queries. Disabling the source.

A source will be temporarily disabled when there are too many errors. When this happens depends on two settings in the source configuration:

- maximum number of failed queries allowed before being disabled (default 200)
- maximum number of failed queries allowed in a time interval (default 86400 sec)

Admin and staff users can sign up for an email alert when a source is disabled.

#### execution expired in [SOURCE]

Timeout error in a source, probably because of intermittent network problems. This can be ignored unless it happens frequently.

#### execution expired (Delayed::Worker.max_run_time is only 3000 seconds) in [SOURCE]

A background job could not be processed in `max_run_time`. This typically happens when queries for individual articles took too long, depending on the following settings in the source configuration:

- job_batch_size: number of articles per job (default 200)
- timeout (default 30 sec)
- batch_time_interval (default 1 hour)

If all 200 jobs take close to 3000 sec, and they will not be done within an hour, and before we process the next batch. Decrease `job_batch_size` and/or `timeout`, or increase `batch_time_interval` if you see to many of these errors for a source.

#### [401] Missing API key.

An API request was done without an API key. Make sure the api_key is declared in `config/settings.yml`.

#### [503] Service Temporarily Unavailable while requesting http://blogs.nature.com/posts.json?doi=DOI

The server is overloaded or we hit rate-limiting. This is a temporary error and can be ignored unless it happens frequently.
