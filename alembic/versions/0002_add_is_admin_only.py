"""Add support for secrets

Revision ID: 0002
Revises: 0001
Create Date: 2021-04-09 21:17:58.343678

"""
import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("sections", sa.Column("is_admin_only", sa.Boolean(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("sections", "is_admin_only")
    # ### end Alembic commands ###
