"""empty message

Revision ID: c26089af7824
Revises:
Create Date: 2021-04-09 21:01:40.279721

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "user",
        sa.Column("id", sa.CHAR(length=36), nullable=False),
        sa.Column("email", sa.VARCHAR(length=320), nullable=False),
        sa.Column("hashed_password", sa.VARCHAR(length=72), nullable=False),
        sa.Column("is_active", sa.BOOLEAN(), nullable=False),
        sa.Column("is_superuser", sa.BOOLEAN(), nullable=False),
        sa.Column("is_verified", sa.BOOLEAN(), nullable=False),
        sa.CheckConstraint("is_active IN (0, 1)"),
        sa.CheckConstraint("is_superuser IN (0, 1)"),
        sa.CheckConstraint("is_verified IN (0, 1)"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_user_email", "user", ["email"], unique=1)
    op.create_table(
        "sections",
        sa.Column("id", sa.INTEGER(), nullable=False),
        sa.Column("wiki_id", sa.VARCHAR(), nullable=True),
        sa.Column("section_index", sa.INTEGER(), nullable=True),
        sa.Column("content", sa.TEXT(), nullable=True),
        sa.Column("page_id", sa.VARCHAR(), nullable=True),
        sa.ForeignKeyConstraint(
            ["page_id"],
            ["pages.id"],
        ),
        sa.ForeignKeyConstraint(
            ["wiki_id", "page_id"],
            ["pages.wiki_id", "pages.id"],
        ),
        sa.ForeignKeyConstraint(
            ["wiki_id"],
            ["wikis.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "oauth_account",
        sa.Column("id", sa.CHAR(length=36), nullable=False),
        sa.Column("oauth_name", sa.VARCHAR(length=100), nullable=False),
        sa.Column("access_token", sa.VARCHAR(length=1024), nullable=False),
        sa.Column("expires_at", sa.INTEGER(), nullable=True),
        sa.Column("refresh_token", sa.VARCHAR(length=1024), nullable=True),
        sa.Column("account_id", sa.VARCHAR(length=320), nullable=False),
        sa.Column("account_email", sa.VARCHAR(length=320), nullable=False),
        sa.Column("user_id", sa.CHAR(length=36), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_oauth_account_oauth_name", "oauth_account", ["oauth_name"], unique=False
    )
    op.create_index(
        "ix_oauth_account_account_id", "oauth_account", ["account_id"], unique=False
    )
    op.create_table(
        "pages",
        sa.Column("id", sa.VARCHAR(), nullable=False),
        sa.Column("wiki_id", sa.VARCHAR(), nullable=False),
        sa.Column("title", sa.VARCHAR(), nullable=True),
        sa.Column("is_admin_only", sa.BOOLEAN(), nullable=True),
        sa.CheckConstraint("is_admin_only IN (0, 1)"),
        sa.ForeignKeyConstraint(
            ["wiki_id"],
            ["wikis.id"],
        ),
        sa.PrimaryKeyConstraint("id", "wiki_id"),
    )
    op.create_table(
        "wikis",
        sa.Column("id", sa.VARCHAR(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table("wikis")
    op.drop_table("pages")
    op.drop_index("ix_oauth_account_account_id", table_name="oauth_account")
    op.drop_index("ix_oauth_account_oauth_name", table_name="oauth_account")
    op.drop_table("oauth_account")
    op.drop_table("sections")
    op.drop_index("ix_user_email", table_name="user")
    op.drop_table("user")
    # ### end Alembic commands ###