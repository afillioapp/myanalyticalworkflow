CREATE TABLE "coverage" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"request_id" uuid NOT NULL,
	"node_id" uuid NOT NULL,
	"state" text NOT NULL,
	"reason" text,
	"operation_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "coverage_one_per_node" UNIQUE("request_id","node_id"),
	CONSTRAINT "coverage_state_check" CHECK (state in ('addressed', 'not_applicable', 'blocked')),
	CONSTRAINT "coverage_reason_check" CHECK (state = 'addressed' or (reason is not null and length(trim(reason)) > 0))
);
--> statement-breakpoint
ALTER TABLE "answers" DROP CONSTRAINT "answers_kind_check";--> statement-breakpoint
ALTER TABLE "edges" DROP CONSTRAINT "edges_type_check";--> statement-breakpoint
ALTER TABLE "operations" DROP CONSTRAINT "operations_kind_check";--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "mode" text;--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "sponsor_id" uuid;--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "question_rounds" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "coverage" ADD CONSTRAINT "coverage_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coverage" ADD CONSTRAINT "coverage_request_id_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_kind_check" CHECK (kind in ('pick', 'new', 'unknown', 'text'));--> statement-breakpoint
ALTER TABLE "edges" ADD CONSTRAINT "edges_type_check" CHECK (type in ('reports_to', 'member_of', 'owns', 'approves', 'performed_by', 'executed_in', 'precedes', 'part_of', 'triggers', 'reads', 'writes', 'integrates_with', 'belongs_to', 'renders_on', 'governed_by', 'derived_from', 'implements', 'traces_to', 'constrains', 'supports'));--> statement-breakpoint
ALTER TABLE "operations" ADD CONSTRAINT "operations_kind_check" CHECK (kind in ('add_node', 'add_edge', 'update_node'));--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_mode_check" CHECK (mode is null or mode in ('request', 'mandate'));